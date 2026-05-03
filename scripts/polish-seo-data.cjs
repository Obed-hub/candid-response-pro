const fs = require('fs');
const path = require('path');

const SEO_DATA_PATH = path.join(__dirname, '../src/data/seo-data.ts');

function polish() {
  console.log('Polishing SEO data...');
  
  let content = fs.readFileSync(SEO_DATA_PATH, 'utf8');
  
  // This is a bit complex with regex, so we'll do some smart string replacements
  // or use a simpler approach since we know the structure.
  
  // 1. Update Freelancers specifically as requested
  content = content.replace(
    'heroTitle: "Anonymous feedback for freelancers"',
    'heroTitle: "Collect anonymous client feedback as a freelancer"'
  );

  // 2. Generic transformations for locations
  // Replace "Feedback insights for [City]" with "Collect anonymous customer feedback in [City]"
  content = content.replace(
    /heroTitle: "Feedback insights for ([^"]+)"/g,
    'heroTitle: "Collect anonymous customer feedback in $1"'
  );

  // 3. Generic transformations for industries
  // Replace "Anonymous feedback for [Industry]" with "Collect anonymous feedback as a [Industry]"
  content = content.replace(
    /heroTitle: "Anonymous feedback for ([^"]+)"/g,
    'heroTitle: "Collect anonymous feedback as a $1"'
  );

  // 4. Improve use cases if they are generic
  content = content.replace(
    'title: "Creative reviews", description: "Get honest thoughts on your designs, code, or writing."',
    'title: "Get honest design feedback", description: "Receive unfiltered critiques before final delivery to ensure client satisfaction."'
  );
  
  content = content.replace(
    'title: "Retail Experience", description: "Improve shopping in',
    'title: "Optimize shopping experience", description: "Learn exactly why customers leave your'
  );

  // 5. Update Sample Feedback to be more realistic (as requested)
  // We'll do a few bulk replacements for common patterns
  content = content.replace(
    'The service at the branch was exceptional today.',
    'The work was great but I felt the communication was a bit slow at times.'
  );

  fs.writeFileSync(SEO_DATA_PATH, content);
  console.log('SEO data polishing complete.');
}

polish();
