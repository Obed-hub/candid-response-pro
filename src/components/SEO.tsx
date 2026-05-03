import { useEffect } from "react";

interface SEOProps {
  title: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
}

export const SEO = ({ title, description, keywords, ogImage = "/logo.png", ogType = "website" }: SEOProps) => {
  useEffect(() => {
    document.title = `${title} | userpov`;

    if (description) {
      let metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute("content", description);
      } else {
        metaDescription = document.createElement("meta");
        metaDescription.setAttribute("name", "description");
        metaDescription.setAttribute("content", description);
        document.head.appendChild(metaDescription);
      }
    }

    if (keywords) {
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (metaKeywords) {
        metaKeywords.setAttribute("content", keywords);
      } else {
        metaKeywords = document.createElement("meta");
        metaKeywords.setAttribute("name", "keywords");
        metaKeywords.setAttribute("content", keywords);
        document.head.appendChild(metaKeywords);
      }
    }

    // Open Graph
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", title);

    if (description) {
      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute("content", description);
    }

    if (ogImage) {
      const ogImg = document.querySelector('meta[property="og:image"]');
      if (ogImg) ogImg.setAttribute("content", ogImage);
    }

    // JSON-LD Schema
    const organizationSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "UserPOV",
      "url": "https://userpov.com",
      "logo": "https://userpov.com/logo.png",
      "description": "Anonymous customer feedback platform for digital and physical businesses.",
      "sameAs": [
        "https://twitter.com/userpov",
        "https://linkedin.com/company/userpov"
      ]
    };

    const websiteSchema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "UserPOV",
      "url": "https://userpov.com",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://userpov.com/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    };

    const navigationSchema = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "itemListElement": [
        {
          "@type": "SiteNavigationElement",
          "position": 1,
          "name": "Group Roadmap",
          "url": "https://userpov.com/roadmap"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 2,
          "name": "Pricing",
          "url": "https://userpov.com/pricing"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 3,
          "name": "Industries",
          "url": "https://userpov.com/industries"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 4,
          "name": "Sign Up",
          "url": "https://userpov.com/signup"
        }
      ]
    };

    // Remove old schema scripts
    document.querySelectorAll('script[type="application/ld+json"]').forEach(el => el.remove());

    // Add new schemas
    [organizationSchema, websiteSchema, navigationSchema].forEach(schema => {
      const script = document.createElement("script");
      script.setAttribute("type", "application/ld+json");
      script.innerHTML = JSON.stringify(schema);
      document.head.appendChild(script);
    });

  }, [title, description, keywords, ogImage, ogType]);

  return null;
};
