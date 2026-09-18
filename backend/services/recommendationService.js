const User = require('../models/User')
const Course = require('../models/Course')
const Lesson = require('../models/Lesson')
const Quiz = require('../models/Quiz')

class RecommendationService {
  /**
   * Generate personalized learning path for a user
   */
  async generateLearningPath(userId) {
    try {
      const user = await User.findById(userId)
        .populate('enrolledCourses')
        .populate('completedLessons.lesson')

      if (!user) {
        throw new Error('User not found')
      }

      const recommendations = []

      // 1. Priority: Address weak areas
      const weakAreas = user.learningDNA.weakAreas
        .filter(area => area.priority === 'high')
        .sort((a, b) => a.score - b.score)

      for (const weakArea of weakAreas.slice(0, 2)) {
        const lessons = await this.findLessonsForTopic(weakArea.topic)
        if (lessons.length > 0) {
          recommendations.push({
            type: 'improvement',
            topic: weakArea.topic,
            lessons: lessons.slice(0, 3),
            reason: `Low performance in ${weakArea.topic} (${weakArea.score}%)`,
            priority: 'high'
          })
        }
      }

      // 2. Continue enrolled courses
      for (const course of user.enrolledCourses) {
        const courseData = await Course.findById(course._id).populate('lessons')
        const completedLessonIds = user.completedLessons.map(cl => cl.lesson.toString())
        
        const nextLesson = courseData.lessons.find(
          lesson => !completedLessonIds.includes(lesson._id.toString())
        )

        if (nextLesson) {
          recommendations.push({
            type: 'continue',
            courseId: course._id,
            courseTitle: course.title,
            lesson: nextLesson,
            reason: 'Continue your enrolled course',
            priority: 'medium'
          })
        }
      }

      // 3. Practice based on recent quiz performance
      const recentQuizzes = user.quizAttempts.slice(-3)
      for (const attempt of recentQuizzes) {
        if (attempt.score < 70) {
          const quiz = await Quiz.findById(attempt.quiz)
          if (quiz) {
            recommendations.push({
              type: 'practice',
              quizId: quiz._id,
              quizTitle: quiz.title,
              topic: quiz.topic,
              reason: `Retake quiz to improve your score (${attempt.score}%)`,
              priority: 'medium'
            })
          }
        }
      }

      // 4. Explore new courses based on interests
      if (user.learningDNA.strongAreas.length > 0) {
        const strongTopic = user.learningDNA.strongAreas[0].topic
        const newCourses = await this.findCoursesForTopic(strongTopic, user.enrolledCourses)
        
        for (const course of newCourses.slice(0, 2)) {
          recommendations.push({
            type: 'explore',
            courseId: course._id,
            courseTitle: course.title,
            reason: `Build on your strength in ${strongTopic}`,
            priority: 'low'
          })
        }
      }

      // Sort by priority
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

      return recommendations
    } catch (error) {
      console.error('Error generating learning path:', error)
      throw error
    }
  }

  /**
   * Find lessons related to a topic
   */
  async findLessonsForTopic(topic) {
    try {
      const courses = await Course.find({
        $or: [
          { title: { $regex: topic, $options: 'i' } },
          { description: { $regex: topic, $options: 'i' } },
          { tags: { $in: [topic.toLowerCase()] } }
        ],
        published: true
      }).populate('lessons')

      const lessons = courses.flatMap(course => 
        course.lessons.map(lesson => ({
          ...lesson._doc,
          courseTitle: course.title,
          courseId: course._id
        }))
      )

      return lessons
    } catch (error) {
      console.error('Error finding lessons:', error)
      return []
    }
  }

  /**
   * Find courses related to a topic (excluding enrolled)
   */
  async findCoursesForTopic(topic, enrolledCourses) {
    try {
      const enrolledIds = enrolledCourses.map(c => c._id.toString())
      
      const courses = await Course.find({
        $or: [
          { title: { $regex: topic, $options: 'i' } },
          { description: { $regex: topic, $options: 'i' } },
          { tags: { $in: [topic.toLowerCase()] } }
        ],
        published: true,
        _id: { $nin: enrolledIds }
      })

      return courses
    } catch (error) {
      console.error('Error finding courses:', error)
      return []
    }
  }

  /**
   * Get daily learning goals for a user
   */
  async getDailyGoals(userId) {
    try {
      const user = await User.findById(userId)
      const learningPath = await this.generateLearningPath(userId)

      const goals = []
      let totalTime = 0
      const targetTime = 60 // 60 minutes target

      // Add high priority items first
      for (const rec of learningPath.filter(r => r.priority === 'high')) {
        if (totalTime >= targetTime) break
        
        if (rec.type === 'improvement' && rec.lessons) {
          for (const lesson of rec.lessons) {
            if (totalTime >= targetTime) break
            goals.push({
              type: 'lesson',
              lessonId: lesson._id,
              title: lesson.title,
              course: lesson.courseTitle,
              duration: Math.min(lesson.videoDuration / 60, 20), // Cap at 20 mins
              priority: 'high'
            })
            totalTime += Math.min(lesson.videoDuration / 60, 20)
          }
        }
      }

      // Add medium priority items
      for (const rec of learningPath.filter(r => r.priority === 'medium')) {
        if (totalTime >= targetTime) break
        
        if (rec.type === 'continue' && rec.lesson) {
          goals.push({
            type: 'lesson',
            lessonId: rec.lesson._id,
            title: rec.lesson.title,
            course: rec.courseTitle,
            duration: Math.min(rec.lesson.videoDuration / 60, 25),
            priority: 'medium'
          })
          totalTime += Math.min(rec.lesson.videoDuration / 60, 25)
        } else if (rec.type === 'practice') {
          goals.push({
            type: 'quiz',
            quizId: rec.quizId,
            title: rec.quizTitle,
            duration: 15,
            priority: 'medium'
          })
          totalTime += 15
        }
      }

      return {
        goals,
        totalTime,
        targetTime,
        completed: Math.min((totalTime / targetTime) * 100, 100)
      }
    } catch (error) {
      console.error('Error getting daily goals:', error)
      return { goals: [], totalTime: 0, targetTime: 60, completed: 0 }
    }
  }

  /**
   * Update user's learning DNA based on activity
   */
  async updateLearningDNA(userId, activity) {
    try {
      const user = await User.findById(userId)
      
      switch (activity.type) {
        case 'quiz_completion':
          await user.updateLearningDNA({
            topic: activity.topic,
            score: activity.score
          })
          break
          
        case 'lesson_completion':
          // Update consistency metric
          const totalActivities = user.completedLessons.length + user.quizAttempts.length
          const recentActivities = user.completedLessons.filter(
            cl => new Date(cl.completedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          ).length
          
          user.learningDNA.consistency = Math.round((recentActivities / 7) * 100)
          await user.save()
          break
          
        case 'streak_update':
          await user.updateStreak()
          break
      }

      return user.learningDNA
    } catch (error) {
      console.error('Error updating learning DNA:', error)
      throw error
    }
  }

  /**
   * Get personalized course recommendations
   */
  async getCourseRecommendations(userId, limit = 5) {
    try {
      const user = await User.findById(userId).populate('enrolledCourses')
      
      const enrolledIds = user.enrolledCourses.map(c => c._id.toString())
      
      // Get courses not enrolled in
      const availableCourses = await Course.find({
        published: true,
        _id: { $nin: enrolledIds }
      })

      const scoredCourses = availableCourses.map(course => {
        let score = 0
        
        // Match with strong areas
        user.learningDNA.strongAreas.forEach(strong => {
          if (course.title.toLowerCase().includes(strong.topic.toLowerCase()) ||
              course.tags.includes(strong.topic.toLowerCase())) {
            score += 30
          }
        })
        
        // Match with weak areas (lower priority)
        user.learningDNA.weakAreas.forEach(weak => {
          if (course.title.toLowerCase().includes(weak.topic.toLowerCase()) ||
              course.tags.includes(weak.topic.toLowerCase())) {
            score += 15
          }
        })
        
        // Match with user's level
        if (user.learningDNA.recommendedDifficulty === 'beginner' && course.level === 'Beginner') {
          score += 20
        } else if (user.learningDNA.recommendedDifficulty === 'intermediate' && course.level === 'Intermediate') {
          score += 20
        } else if (user.learningDNA.recommendedDifficulty === 'advanced' && course.level === 'Advanced') {
          score += 20
        }
        
        // Consider course rating
        score += course.rating.average * 5
        
        // Consider popularity
        score += Math.min(course.enrolledStudents.length / 100, 10)
        
        return { ...course._doc, recommendationScore: score }
      })

      // Sort by score and return top results
      scoredCourses.sort((a, b) => b.recommendationScore - a.recommendationScore)
      
      return scoredCourses.slice(0, limit)
    } catch (error) {
      console.error('Error getting course recommendations:', error)
      return []
    }
  }

  /**
   * Analyze learning patterns and provide insights
   */
  async analyzeLearningPatterns(userId) {
    try {
      const user = await User.findById(userId)
        .populate('completedLessons.lesson')
        .populate('quizAttempts.quiz')

      const patterns = {
        bestTimeOfDay: null,
        averageSessionLength: 0,
        preferredContentTypes: [],
        learningVelocity: 'normal',
        consistency: user.learningDNA.consistency,
        recommendations: []
      }

      // Analyze completion times (would need timestamp data)
      // For now, use mock data
      
      // Analyze preferred content types
      const lessonCompletions = user.completedLessons.length
      const quizAttempts = user.quizAttempts.length
      
      if (lessonCompletions > quizAttempts) {
        patterns.preferredContentTypes.push('video lessons')
      } else if (quizAttempts > lessonCompletions) {
        patterns.preferredContentTypes.push('quizzes')
      } else {
        patterns.preferredContentTypes.push('mixed content')
      }

      // Determine learning velocity
      const totalXP = user.gamification.xp
      const accountAge = Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24))
      
      if (accountAge > 0) {
        const xpPerDay = totalXP / accountAge
        if (xpPerDay > 100) {
          patterns.learningVelocity = 'fast'
        } else if (xpPerDay < 30) {
          patterns.learningVelocity = 'slow'
        }
      }

      // Generate recommendations based on patterns
      if (patterns.consistency < 50) {
        patterns.recommendations.push('Try to maintain a daily learning schedule for better retention')
      }
      
      if (patterns.learningVelocity === 'slow') {
        patterns.recommendations.push('Consider setting smaller, achievable daily goals')
      }
      
      if (user.learningDNA.weakAreas.length > 3) {
        patterns.recommendations.push('Focus on strengthening your weak areas before starting new courses')
      }

      return patterns
    } catch (error) {
      console.error('Error analyzing learning patterns:', error)
      throw error
    }
  }
}

module.exports = new RecommendationService()
