const fs = require('fs');
const path = require('path');

const SEO_DATA_PATH = path.join(__dirname, '../src/data/seo-data.ts');

const US_CITIES = [
  "Jacksonville", "Fort Worth", "Columbus", "Charlotte", "Indianapolis", "Seattle", "Denver", "Washington", "El Paso", "Nashville",
  "Oklahoma City", "Las Vegas", "Portland", "Detroit", "Memphis", "Louisville", "Milwaukee", "Baltimore", "Albuquerque", "Tucson",
  "Fresno", "Sacramento", "Mesa", "Kansas City", "Atlanta", "Long Beach", "Omaha", "Raleigh", "Colorado Springs", "Miami",
  "Virginia Beach", "Oakland", "Minneapolis", "Tulsa", "Arlington", "New Orleans", "Wichita", "Cleveland", "Tampa", "Bakersfield"
];

const UK_CITIES = [
  "Leeds", "Sheffield", "Cardiff", "Belfast", "Leicester", "Coventry", "Nottingham", "Newcastle", "Brighton", "Milton Keynes",
  "Plymouth", "Southampton", "Reading", "Derby", "Aberdeen", "Portsmouth", "Swansea", "Salford", "Westminster", "Kingston",
  "Stoke", "Wolverhampton", "Cambridge", "Oxford", "Gloucester", "Newport", "Lincoln", "Chester", "York", "Bath"
];

const AFRICA_CITIES = [
  "Ibadan", "Benin City", "Enugu", "Jos", "Ilorin", "Maiduguri", "Zaria", "Warri", "Akure", "Abeokuta",
  "Bauchi", "Katsina", "Gombe", "Lokoja", "Owerri", "Port Harcourt", "Calabar", "Uyo", "Sokoto", "Minna",
  "Yola", "Abakaliki", "Dutse", "Birnin Kebbi", "Gombe", "Jalingo", "Lafia", "Yenagoa", "Damaturu", "Gusau"
];

const INDUSTRIES = [
  "Mobile Apps", "Web Design Agencies", "Beauty Brands", "Car Dealerships", "Spas", "Gyms", "Co-working Spaces", "Travel Agencies", "Clinics", "Pharmacies"
];

function generateLocationRecord(city, countryCode = 'US') {
  const slug = city.toLowerCase().replace(/\s+/g, '-');
  return `  {
    slug: "${slug}",
    type: "location",
    name: "${city}",
    keyword: "customer feedback tools ${city.toLowerCase()}",
    shortDescription: "Improve your ${city} business with real-time feedback.",
    metaTitle: "Customer Feedback Tools in ${city} | UserPOV",
    metaDescription: "Grow your ${city} business with local feedback insights. Perfect for retail, hospitality, and tech in ${city}.",
    heroTitle: "Feedback insights for ${city}",
    heroSubtitle: "Listen to the pulse of ${city}. Capture real-time feedback from customers across the city.",
    ctaPrimary: "Grow in ${city}",
    useCases: [
      { title: "Retail Experience", description: "Improve shopping in ${city}'s diverse neighborhoods." },
      { title: "Hospitality Service", description: "Capture sentiment in ${city}'s cafes and restaurants." },
      { title: "Local Tech Scene", description: "UX feedback for ${city}'s growing business community." }
    ],
    painPoints: ["High competition in the local market", "Need for real-time insights to drive improvements", "Hard to capture feedback from busy residents"],
    benefits: ["Increased customer loyalty in ${city}", "Faster resolution of service issues", "Stronger brand reputation"],
    features: [
      { name: "Local Support Hub", description: "Dedicated account management for ${city} firms." },
      { name: "Real-time Dashboard", description: "Monitor all your ${city} locations." },
      { name: "Instant Issue Alerts", description: "Get notified of problems immediately." }
    ],
    sampleFeedback: ["The service at the ${city} branch was exceptional today.", "Loved the new menu items!", "The staff were very helpful and professional."],
    faqs: [
      { question: "Do you support multiple locations?", answer: "Yes, our platform is built for multi-site businesses in ${city}." },
      { question: "Is it easy to set up?", answer: "You can be live in minutes." }
    ],
    relatedPages: ["anonymous-feedback-for-retail", "anonymous-feedback-for-restaurants"]
  }`;
}

function expand() {
  console.log('Expanding SEO data...');
  
  let content = fs.readFileSync(SEO_DATA_PATH, 'utf8');
  
  // Find the last ] before the end of the export
  const lastIndex = content.lastIndexOf('];');
  if (lastIndex === -1) {
    console.error('Could not find end of seoPages array');
    return;
  }

  const newRecords = [];
  
  /*
  // Add US Cities
  US_CITIES.forEach(city => {
    if (!content.includes(`slug: "${city.toLowerCase().replace(/\s+/g, '-')}"`)) {
      newRecords.push(generateLocationRecord(city, 'US'));
    }
  });

  // Add UK Cities
  UK_CITIES.forEach(city => {
    if (!content.includes(`slug: "${city.toLowerCase().replace(/\s+/g, '-')}"`)) {
      newRecords.push(generateLocationRecord(city, 'UK'));
    }
  });

  // Add African Cities
  AFRICA_CITIES.forEach(city => {
    if (!content.includes(`slug: "${city.toLowerCase().replace(/\s+/g, '-')}"`)) {
      newRecords.push(generateLocationRecord(city, 'NG'));
    }
  });
  */

  console.log(`Adding ${newRecords.length} new records...`);

  const updatedContent = content.slice(0, lastIndex).trim() + ',\n' + newRecords.join(',\n') + '\n];\n';
  
  fs.writeFileSync(SEO_DATA_PATH, updatedContent);
  console.log('SEO data expansion complete.');
}

expand();
