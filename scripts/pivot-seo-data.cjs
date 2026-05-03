const fs = require('fs');
const path = require('path');

const SEO_DATA_PATH = path.join(__dirname, '../src/data/seo-data.ts');

function pivot() {
  console.log('Pivoting SEO data to industry focus...');
  
  let content = fs.readFileSync(SEO_DATA_PATH, 'utf8');
  
  // 1. Remove all location entries
  // We'll use a regex that matches { ... type: "location" ... }
  // This is tricky because of nested braces, but since we know the structure is fairly flat (objects in an array),
  // we can look for the object start and end.
  // Actually, a simpler way is to split by },\n  { and filter.
  
  const header = content.substring(0, content.indexOf('export const seoPages: SEOPageData[] = [') + 'export const seoPages: SEOPageData[] = ['.length);
  const footer = '];\n';
  
  // Extract the array content
  const arrayStart = content.indexOf('export const seoPages: SEOPageData[] = [') + 'export const seoPages: SEOPageData[] = ['.length;
  const arrayEnd = content.lastIndexOf('];');
  const arrayContent = content.substring(arrayStart, arrayEnd).trim();
  
  // Split by top-level object boundaries
  // We look for \n  { at the start of a line.
  const entries = arrayContent.split(/,\n  {/).map((e, i) => {
    let clean = e.trim();
    if (!clean.startsWith('{')) clean = '{' + clean;
    if (!clean.endsWith('}')) clean = clean + '}';
    return clean;
  });
  
  console.log(`Initial entries: ${entries.length}`);
  
  const filteredEntries = entries.filter(e => !e.includes('type: "location"'));
  
  console.log(`Filtered entries (removed locations): ${filteredEntries.length}`);
  
  // 2. Define new industry entries
  const restaurantChains = `{
    slug: "restaurant-chains",
    type: "industry",
    name: "Restaurant Chains",
    keyword: "anonymous feedback for restaurant chains",
    shortDescription: "Standardize guest experience across all your restaurant locations.",
    metaTitle: "Anonymous Feedback for Restaurant Chains | UserPOV",
    metaDescription: "Monitor service consistency and food quality across all your restaurant branches with real-time anonymous feedback and QR codes.",
    heroTitle: "Collect anonymous feedback as a restaurant chains",
    heroSubtitle: "Consistency is key to a successful chain. Capture real-time insights from every table, in every branch, to ensure 5-star service everywhere.",
    ctaPrimary: "Standardize Your Service",
    useCases: [
      { title: "Standardization checks", description: "Identify which branches are hitting your brand standards and which aren't." },
      { title: "Shift performance tracking", description: "Monitor quality across morning, afternoon, and night shifts." },
      { title: "Menu item consistency", description: "Ensure your signature dishes taste the same in every city." },
      { title: "Service recovery", description: "Catch regional issues before they impact your global brand reputation." }
    ],
    painPoints: [
      "Inconsistent service quality across different locations",
      "Hard to monitor staff performance without being physically present",
      "Negative experiences in one branch damaging the entire brand"
    ],
    benefits: [
      "Unified brand experience across all locations",
      "Data-driven regional management",
      "Faster identification of underperforming branches"
    ],
    features: [
      { name: "Multi-location Dashboard", description: "Compare performance across all your restaurant sites." },
      { name: "Role-based Access", description: "Give branch managers access to their own data while you see everything." },
      { name: "Regional Alerts", description: "Get notified of critical issues in specific areas." }
    ],
    sampleFeedback: [
      "The fries were cold at the downtown branch, but perfect at the uptown one.",
      "Service was much faster today than last week.",
      "I love this chain, but this location needs better lighting."
    ],
    faqs: [
      { question: "Can I see data for each branch separately?", answer: "Yes, you can filter feedback by location, city, or region." },
      { question: "How do I deploy this to 50+ locations?", answer: "We provide bulk QR code generation and easy onboarding for branch managers." }
    ],
    relatedPages: ["restaurants", "anonymous-feedback-for-fast-food", "customer-feedback-for-franchises"]
  }`;

  const hotelChains = `{
    slug: "hotel-chains",
    type: "industry",
    name: "Hotel Chains",
    keyword: "anonymous feedback for hotel chains",
    shortDescription: "Capture guest sentiment across your entire hotel portfolio.",
    metaTitle: "Anonymous Feedback for Hotel Chains & Resorts | UserPOV",
    metaDescription: "Improve guest satisfaction and loyalty across your hotel chain. Capture private feedback on housekeeping, staff, and amenities.",
    heroTitle: "Collect anonymous feedback as a hotel chains",
    heroSubtitle: "Turn guests into loyal fans by listening to them in the moment. Capture honest feedback across all your properties to ensure a premium experience.",
    ctaPrimary: "Improve Guest Loyalty",
    useCases: [
      { title: "Guest experience tracking", description: "Monitor the entire guest journey from check-in to check-out." },
      { title: "Housekeeping quality", description: "Get real-time feedback on room cleanliness and maintenance." },
      { title: "Staff professionalism", description: "Understand guest interactions with front desk and concierge staff." },
      { title: "Food & beverage reviews", description: "Capture sentiment on hotel restaurants and room service." }
    ],
    painPoints: [
      "Negative reviews appearing on public sites without warning",
      "Silent guest dissatisfaction leads to lost repeat business",
      "Difficulty maintaining 5-star standards across multiple properties"
    ],
    benefits: [
      "Higher guest return and referral rates",
      "Improved operational efficiency",
      "Real-time service recovery opportunities"
    ],
    features: [
      { name: "In-room QR Codes", description: "Discreet feedback cards in every guest room." },
      { name: "Guest Messaging", description: "Private channel to resolve issues before guests check out." },
      { name: "Portfolio Analytics", description: "Visualize guest sentiment across your entire hotel group." }
    ],
    sampleFeedback: [
      "The check-in process was very smooth, and the room was spotless.",
      "Would love to have more vegan options in the breakfast buffet.",
      "The AC in room 402 was a bit noisy at night."
    ],
    faqs: [
      { question: "Is guest feedback really anonymous?", answer: "Yes, we prioritize guest privacy to ensure you get the most honest insights." },
      { question: "Can we reply to guests?", answer: "Yes, you can chat with guests privately if they choose to allow it." }
    ],
    relatedPages: ["anonymous-feedback-for-hotels", "hospitality-feedback-tools", "guest-satisfaction-survey-software"]
  }`;

  filteredEntries.push(restaurantChains);
  filteredEntries.push(hotelChains);
  
  console.log(`Final entries (added chains): ${filteredEntries.length}`);
  
  const updatedContent = header + '\n  ' + filteredEntries.join(',\n  ') + '\n' + footer;
  
  fs.writeFileSync(SEO_DATA_PATH, updatedContent);
  console.log('SEO data pivot complete.');
}

pivot();
