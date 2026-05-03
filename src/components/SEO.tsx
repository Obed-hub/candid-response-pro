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
    const schemaData = {
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

    let script = document.querySelector('script[type="application/ld+json"]');
    if (script) {
      script.innerHTML = JSON.stringify(schemaData);
    } else {
      script = document.createElement("script");
      script.setAttribute("type", "application/ld+json");
      script.innerHTML = JSON.stringify(schemaData);
      document.head.appendChild(script);
    }

  }, [title, description, keywords, ogImage, ogType]);

  return null;
};
