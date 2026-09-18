const User = require('../models/User')
const Course = require('../models/Course')

class CertificateService {
  /**
   * Generate certificate data for a completed course
   */
  async generateCertificate(userId, courseId) {
    try {
      const user = await User.findById(userId)
      const course = await Course.findById(courseId).populate('instructor', 'name')
      
      if (!user || !course) {
        throw new Error('User or course not found')
      }
      
      // Check if user has completed the course
      const courseProgress = course.getStudentProgress(userId)
      if (courseProgress.percentage < 100) {
        throw new Error('Course not completed')
      }
      
      // Generate certificate ID
      const certificateId = this.generateCertificateId(userId, courseId)
      
      // Generate certificate data
      const certificate = {
        id: certificateId,
        studentName: user.name,
        courseName: course.title,
        instructorName: course.instructor.name,
        completionDate: new Date().toLocaleDateString(),
        issueDate: new Date().toISOString(),
        verificationCode: this.generateVerificationCode(certificateId),
        score: courseProgress.percentage
      }
      
      return certificate
    } catch (error) {
      console.error('Certificate generation error:', error)
      throw error
    }
  }
  
  /**
   * Generate unique certificate ID
   */
  generateCertificateId(userId, courseId) {
    const timestamp = Date.now().toString(36)
    const userHash = userId.toString().slice(-4)
    const courseHash = courseId.toString().slice(-4)
    return `CERT-${userHash}-${courseHash}-${timestamp}`.toUpperCase()
  }
  
  /**
   * Generate verification code
   */
  generateVerificationCode(certificateId) {
    const hash = certificateId.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0)
    }, 0)
    return (hash % 1000000).toString().padStart(6, '0')
  }
  
  /**
   * Verify certificate
   */
  async verifyCertificate(certificateId) {
    try {
      // In production, this would check against a database of issued certificates
      // For now, return validation based on format
      const isValid = /^CERT-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]+$/.test(certificateId)
      
      return {
        valid: isValid,
        certificateId,
        message: isValid ? 'Certificate is valid' : 'Invalid certificate format'
      }
    } catch (error) {
      console.error('Certificate verification error:', error)
      throw error
    }
  }
  
  /**
   * Get certificate HTML template
   */
  getCertificateHTML(certificate) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Certificate of Completion</title>
        <style>
          body {
            font-family: 'Georgia', serif;
            margin: 0;
            padding: 40px;
            background: #f5f5f5;
          }
          .certificate {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 60px;
            border: 10px solid #1a365d;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            text-align: center;
            position: relative;
          }
          .certificate::before {
            content: '';
            position: absolute;
            top: 20px;
            left: 20px;
            right: 20px;
            bottom: 20px;
            border: 2px solid #c4a77d;
            pointer-events: none;
          }
          .logo {
            font-size: 48px;
            color: #1a365d;
            margin-bottom: 20px;
          }
          .title {
            font-size: 14px;
            letter-spacing: 4px;
            color: #666;
            margin-bottom: 30px;
          }
          .certificate-title {
            font-size: 48px;
            color: #1a365d;
            margin: 20px 0;
            font-weight: bold;
          }
          .presented-to {
            font-size: 18px;
            color: #666;
            margin: 30px 0 10px;
          }
          .student-name {
            font-size: 36px;
            color: #1a365d;
            margin: 10px 0 30px;
            font-weight: bold;
            border-bottom: 2px solid #c4a77d;
            display: inline-block;
            padding: 0 40px;
          }
          .course-info {
            font-size: 20px;
            color: #333;
            margin: 20px 0;
            line-height: 1.6;
          }
          .course-name {
            font-size: 28px;
            color: #1a365d;
            font-weight: bold;
            margin: 10px 0;
          }
          .signature-section {
            display: flex;
            justify-content: space-around;
            margin-top: 60px;
          }
          .signature {
            text-align: center;
          }
          .signature-line {
            border-top: 2px solid #333;
            width: 200px;
            margin-top: 40px;
          }
          .signature-label {
            font-size: 14px;
            color: #666;
            margin-top: 10px;
          }
          .verification {
            margin-top: 40px;
            font-size: 12px;
            color: #999;
          }
          .verification-code {
            font-family: monospace;
            font-size: 14px;
            color: #1a365d;
          }
          .seal {
            position: absolute;
            bottom: 60px;
            right: 60px;
            width: 100px;
            height: 100px;
            border: 3px solid #c4a77d;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            color: #c4a77d;
            transform: rotate(-15deg);
          }
        </style>
      </head>
      <body>
        <div class="certificate">
          <div class="logo">🎓</div>
          <div class="title">CERTIFICATE OF COMPLETION</div>
          
          <h1 class="certificate-title">Certificate</h1>
          
          <div class="presented-to">This certificate is proudly presented to</div>
          <div class="student-name">${certificate.studentName}</div>
          
          <div class="course-info">
            For successfully completing the course<br>
            <div class="course-name">${certificate.courseName}</div>
            with a score of ${certificate.score}%
          </div>
          
          <div class="signature-section">
            <div class="signature">
              <div class="signature-line"></div>
              <div class="signature-label">${certificate.instructorName}</div>
              <div class="signature-label">Instructor</div>
            </div>
            <div class="signature">
              <div class="signature-line"></div>
              <div class="signature-label">LearnX</div>
              <div class="signature-label">Director</div>
            </div>
          </div>
          
          <div class="verification">
            Verification Code: <span class="verification-code">${certificate.verificationCode}</span><br>
            Certificate ID: ${certificate.id}<br>
            Issued: ${certificate.completionDate}
          </div>
          
          <div class="seal">
            OFFICIAL<br>SEAL
          </div>
        </div>
      </body>
      </html>
    `
  }
}

module.exports = new CertificateService()
