/**
 * Demi AI - Local elaboration engine
 * Enhances text by keeping meaning same while expanding depth and credibility
 */

const elaborationPatterns = {
  professional: {
    strategies: [
      (text: string) => {
        // Add specificity and metrics focus
        const metrics = ['improving', 'increasing', 'reducing', 'delivering', 'achieving'];
        let enhanced = text;
        metrics.forEach(metric => {
          enhanced = enhanced.replace(
            new RegExp(metric, 'gi'),
            metric === 'improving' ? 'enhancing and optimizing' :
            metric === 'increasing' ? 'substantially increasing' :
            metric === 'reducing' ? 'systematically reducing' :
            metric === 'delivering' ? 'consistently delivering value through' :
            'strategically achieving'
          );
        });
        return enhanced;
      },
      (text: string) => {
        // Add depth indicators
        if (!text.includes('leverage') && !text.includes('utilize') && text.length < 150) {
          const endings = [
            ' leveraging modern best practices and industry standards.',
            ' through strategic implementation and measurable outcomes.',
            ' by combining technical expertise with business acumen.',
            ' ensuring scalability, performance, and user satisfaction.'
          ];
          return text + endings[Math.floor(Math.random() * endings.length)];
        }
        return text;
      },
      (text: string) => {
        // Strengthen action verbs
        const verbMap: Record<string, string> = {
          'built': 'architected and deployed',
          'made': 'engineered and implemented',
          'created': 'designed and developed',
          'helped': 'collaborated to deliver',
          'worked': 'specialized in driving',
          'used': 'leveraged expertise in'
        };
        let enhanced = text;
        Object.entries(verbMap).forEach(([weak, strong]) => {
          enhanced = enhanced.replace(new RegExp(`\\b${weak}\\b`, 'gi'), strong);
        });
        return enhanced;
      }
    ]
  },
  hacker: {
    strategies: [
      (text: string) => {
        // Add technical specificity
        const techTerms = ['implementation', 'optimization', 'architecture', 'scalability', 'performance'];
        let enhanced = text;
        if (!text.toLowerCase().includes('stack')) {
          enhanced = enhanced + ' Focused on system-level optimization and clean, efficient code.';
        }
        return enhanced;
      },
      (text: string) => {
        // Add precision language
        const vague = ['good', 'nice', 'cool', 'interesting', 'thing'];
        let enhanced = text;
        const techReplace: Record<string, string> = {
          'good': 'robust',
          'nice': 'elegant',
          'cool': 'sophisticated',
          'interesting': 'non-trivial',
          'thing': 'system'
        };
        vague.forEach(term => {
          enhanced = enhanced.replace(new RegExp(`\\b${term}\\b`, 'gi'), techReplace[term]);
        });
        return enhanced;
      },
      (text: string) => {
        // Emphasize technical depth
        if (text.length < 120 && !text.includes('complex')) {
          return text + ' Handles complex requirements with minimal dependencies and maximum efficiency.';
        }
        return text;
      }
    ]
  },
  creative: {
    strategies: [
      (text: string) => {
        // Add sensory and emotional language
        const emotionalBoosts = [
          ' with a focus on delightful user experiences.',
          ' celebrating the intersection of form and function.',
          ' crafted with attention to every visual and interactive detail.',
          ' designed to inspire and engage.',
          ' bringing imagination to life through technology.'
        ];
        if (!text.includes('experience') && !text.includes('design')) {
          return text + emotionalBoosts[Math.floor(Math.random() * emotionalBoosts.length)];
        }
        return text;
      },
      (text: string) => {
        // Make it more narrative-driven
        const narrativePhrase = [
          'The journey involved exploring innovative solutions to ',
          'This project challenged me to reimagine ',
          'By combining creativity with technical skill, I developed ',
          'The vision behind this was to transform '
        ];
        if (!text.toLowerCase().startsWith('the') && !text.toLowerCase().startsWith('by')) {
          return narrativePhrase[Math.floor(Math.random() * narrativePhrase.length)] + text.toLowerCase();
        }
        return text;
      },
      (text: string) => {
        // Add impact and meaning
        if (text.length < 140) {
          const impacts = [
            ' This work reflects my philosophy of creating meaningful, lasting digital experiences.',
            ' Every element was thoughtfully considered to create a cohesive, memorable experience.',
            ' The result is something that not only works beautifully but also tells a story.',
            ' It represents a commitment to both aesthetic and functional excellence.'
          ];
          return text + impacts[Math.floor(Math.random() * impacts.length)];
        }
        return text;
      }
    ]
  }
};

export function elaborateText(
  text: string,
  vibe: 'professional' | 'hacker' | 'creative',
  type: 'bio' | 'project'
): string {
  if (!text || text.trim().length < 5) return text;

  const patterns = elaborationPatterns[vibe];
  let result = text.trim();

  // Apply 1-2 random strategies based on text length
  const numStrategies = result.length < 100 ? 2 : 1;
  const shuffled = [...patterns.strategies].sort(() => Math.random() - 0.5);

  for (let i = 0; i < numStrategies && i < shuffled.length; i++) {
    result = shuffled[i](result);
  }

  // Ensure no duplicate sentences
  const sentences = result.split('. ');
  const uniqueSentences = [...new Set(sentences)];
  result = uniqueSentences.join('. ');

  return result.trim();
}

/**
 * Generate bio from keywords using demi AI patterns
 */
export function generateBioFromKeywords(
  keywords: string,
  vibe: 'professional' | 'hacker' | 'creative'
): string {
  const bioTemplates = {
    professional: [
      `${keywords} professional with expertise in driving measurable business impact through strategic technology solutions and leadership excellence.`,
      `Results-oriented ${keywords} specialist delivering comprehensive solutions that bridge technical innovation with business objectives.`,
      `Strategic ${keywords} leader committed to engineering scalable systems and fostering high-performance teams.`
    ],
    hacker: [
      `${keywords} engineer focused on building robust, high-performance systems. Passionate about clean code, architecture, and solving complex problems at scale.`,
      `${keywords} developer who takes pride in crafting elegant solutions. Specializes in systems design, optimization, and technical depth.`,
      `${keywords} specialist dedicated to pushing technical boundaries. Expert in architecting scalable solutions and mentoring teams.`
    ],
    creative: [
      `${keywords} creator passionate about designing experiences that inspire and delight. Combining technical skill with artistic vision to bring ideas to life.`,
      `${keywords} innovator focused on blending creativity with technology. Dedicated to crafting memorable digital experiences and pushing creative boundaries.`,
      `${keywords} enthusiast who believes great work happens at the intersection of art and engineering. Always exploring new ways to innovate.`
    ]
  };

  const templates = bioTemplates[vibe];
  const selected = templates[Math.floor(Math.random() * templates.length)];
  return elaborateText(selected, vibe, 'bio');
}

/**
 * Generate project description from title using demi AI patterns
 */
export function generateProjectFromTitle(
  title: string,
  vibe: 'professional' | 'hacker' | 'creative'
): string {
  const projectTemplates = {
    professional: [
      `Strategic implementation of ${title} delivering measurable value and competitive advantage through innovative solution design.`,
      `Engineered ${title} to optimize performance and drive business objectives. Features comprehensive functionality with enterprise-grade reliability.`,
      `Developed ${title} addressing critical business needs with scalable architecture and proven methodologies.`
    ],
    hacker: [
      `Built ${title} with focus on system efficiency and clean architecture. Handles complex requirements with optimized performance and maintainable code.`,
      `Engineered ${title} emphasizing technical excellence and scalability. Minimalist approach with maximum functionality and performance.`,
      `Architected ${title} as a robust solution combining technical depth with elegant design patterns.`
    ],
    creative: [
      `Crafted ${title} with meticulous attention to user experience and visual design. Every interaction thoughtfully considered for maximum delight.`,
      `Created ${title} blending innovative design with solid technical foundation. A testament to creative problem-solving and user-centric development.`,
      `Designed ${title} to deliver memorable experiences. Combines aesthetic excellence with functional precision.`
    ]
  };

  const templates = projectTemplates[vibe];
  const selected = templates[Math.floor(Math.random() * templates.length)];
  return elaborateText(selected, vibe, 'project');
}
