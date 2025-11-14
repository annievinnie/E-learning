import React, { useMemo } from 'react';

const CourseOverview = ({ course }) => {
  // Analyze course content to extract key information
  const analyzedContent = useMemo(() => {
    if (!course) return null;

    const sortedModules = course.modules
      ? [...course.modules].sort((a, b) => (a.order || 0) - (b.order || 0))
      : [];

    // Extract all text content for analysis
    const allText = [
      course.description || '',
      ...sortedModules.map(m => m.title || ''),
      ...sortedModules.map(m => m.description || ''),
      ...sortedModules.filter(m => m.video).map(m => m.video.title || ''),
      ...sortedModules.filter(m => m.video).map(m => m.video.description || '')
    ].join(' ').toLowerCase();

    // Extract key learning points from module titles and descriptions
    const extractLearningPoints = () => {
      const points = [];
      const seen = new Set();

      // Analyze each module for key concepts
      sortedModules.forEach(module => {
        if (module.title) {
          // Extract action verbs and key concepts from titles
          const title = module.title.trim();
          if (title && !seen.has(title.toLowerCase())) {
            // Format as learning outcome
            let formatted = title;
            // Add action verb if missing
            if (!/^(learn|master|understand|build|create|develop|design|implement|explore|discover)/i.test(title)) {
              formatted = `Learn ${title}`;
            }
            points.push(formatted);
            seen.add(title.toLowerCase());
          }
        }

        // Extract key phrases from descriptions
        if (module.description) {
          const desc = module.description;
          // Look for sentences that indicate learning outcomes
          const sentences = desc.split(/[.!?]+/).filter(s => s.trim().length > 20);
          sentences.forEach(sentence => {
            const trimmed = sentence.trim();
            // Check if it's a learning outcome sentence
            if (/will (learn|understand|master|build|create|develop|design|implement|explore|discover|know|be able)/i.test(trimmed) ||
                /you (will|can|are able to)/i.test(trimmed)) {
              const keyPoint = trimmed.substring(0, 100).trim();
              if (keyPoint && !seen.has(keyPoint.toLowerCase())) {
                points.push(keyPoint);
                seen.add(keyPoint.toLowerCase());
              }
            }
          });
        }
      });

      // If we don't have enough points, use module titles as fallback
      if (points.length < 3) {
        sortedModules.slice(0, 6).forEach(module => {
          if (module.title && !seen.has(module.title.toLowerCase())) {
            points.push(module.title);
            seen.add(module.title.toLowerCase());
          }
        });
      }

      return points.slice(0, 8); // Limit to top 8 key points
    };

    // Identify key topics/themes
    const extractKeyTopics = () => {
      const topics = new Set();
      const commonTechTerms = [
        'javascript', 'react', 'node', 'mongodb', 'html', 'css', 'python', 'java', 'sql',
        'api', 'database', 'frontend', 'backend', 'framework', 'library', 'algorithm',
        'data structure', 'design pattern', 'authentication', 'deployment', 'testing'
      ];

      const commonConcepts = [
        'fundamentals', 'basics', 'advanced', 'intermediate', 'project', 'application',
        'development', 'programming', 'coding', 'software', 'web', 'mobile', 'app'
      ];

      const allTerms = [...commonTechTerms, ...commonConcepts];
      
      allTerms.forEach(term => {
        if (allText.includes(term.toLowerCase())) {
          topics.add(term.charAt(0).toUpperCase() + term.slice(1));
        }
      });

      return Array.from(topics).slice(0, 5);
    };

    // Calculate course statistics
    const stats = {
      totalModules: sortedModules.length,
      totalVideos: sortedModules.filter(m => m.video).length,
      totalDuration: course.duration || 'N/A',
      category: course.category || 'General',
      level: course.level ? course.level.charAt(0).toUpperCase() + course.level.slice(1) : 'Beginner'
    };

    return {
      description: course.description,
      learningPoints: extractLearningPoints(),
      keyTopics: extractKeyTopics(),
      stats,
      modules: sortedModules
    };
  }, [course]);

  if (!analyzedContent) {
    return (
      <div>
        <p className="text-muted">Loading course overview...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Course Description */}
      {analyzedContent.description && (
        <div className="mb-5">
          <h3>About this course</h3>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#555' }}>
            {analyzedContent.description}
          </p>
        </div>
      )}

      {/* Key Topics/Themes */}
      {analyzedContent.keyTopics.length > 0 && (
        <div className="mb-5">
          <h4>Key Topics Covered</h4>
          <div className="d-flex flex-wrap gap-2">
            {analyzedContent.keyTopics.map((topic, index) => (
              <span key={index} className="badge bg-primary" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Requirements */}
      <div className="mt-5">
        <h4>Requirements</h4>
        <p className="text-muted">
          {course?.requirements || 
            (analyzedContent.stats?.level === 'Beginner' 
              ? 'No prior experience required. This course is suitable for beginners.'
              : analyzedContent.stats?.level === 'Intermediate'
              ? 'Basic knowledge recommended. Some prior experience would be helpful.'
              : 'Advanced knowledge required. This course is designed for experienced learners.')}
        </p>
      </div>
    </div>
  );
};

export default CourseOverview;

