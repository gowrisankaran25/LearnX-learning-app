const Quiz = require('../models/Quiz')

describe('Quiz scoring', () => {
  test('scores answers keyed by question id', () => {
    const quiz = new Quiz({
      questions: [
        { type: 'mcq', question: 'One plus one?', options: ['1', '2'], correctAnswer: 1, points: 1, order: 1 },
        { type: 'truefalse', question: 'The sky is blue.', options: ['False', 'True'], correctAnswer: 1, points: 1, order: 2 },
      ],
    })

    const answers = {}
    answers[quiz.questions[0]._id.toString()] = 1
    answers[quiz.questions[1]._id.toString()] = 0

    expect(quiz.calculateScore(answers)).toBe(50)
  })
})
