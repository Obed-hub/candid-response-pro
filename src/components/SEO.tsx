import { useEffect } from "react";

interface SEOProps {
  title: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  canonical?: string;
}

export const SEO = ({ title, description, keywords, ogImage = "https://userpov.online/og-image.png", ogType = "website", canonical }: SEOProps) => {
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

    // Canonical
    const canonicalUrl = canonical || window.location.origin + window.location.pathname;
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (linkCanonical) {
      linkCanonical.setAttribute("href", canonicalUrl);
    } else {
      linkCanonical = document.createElement("link");
      linkCanonical.setAttribute("rel", "canonical");
      linkCanonical.setAttribute("href", canonicalUrl);
      document.head.appendChild(linkCanonical);
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
      "@id": "https://userpov.online/#organization",
      "name": "UserPOV",
      "url": "https://userpov.online",
      "logo": "https://userpov.online/icon.png",
      "description": "Anonymous customer feedback platform for digital and physical businesses.",
      "sameAs": [
        "https://twitter.com/userpov",
        "https://linkedin.com/company/userpov"
      ]
    };

    const websiteSchema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": "https://userpov.online/#website",
      "name": "UserPOV",
      "url": "https://userpov.online",
      "publisher": { "@id": "https://userpov.online/#organization" }
    };

    // Breadcrumbs logic
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    const breadcrumbList = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://userpov.online"
        },
        ...pathSegments.map((segment, index) => ({
          "@type": "ListItem",
          "position": index + 2,
          "name": segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
          "item": `https://userpov.online/${pathSegments.slice(0, index + 1).join('/')}`
        }))
      ]
    };

    const navigationSchema = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "Main Navigation",
      "itemListElement": [
        {
          "@type": "SiteNavigationElement",
          "position": 1,
          "name": "Pricing",
          "url": "https://userpov.online/pricing"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 2,
          "name": "Roadmap",
          "url": "https://userpov.online/roadmap"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 3,
          "name": "Industries",
          "url": "https://userpov.online/#use-cases"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 4,
          "name": "About Us",
          "url": "https://userpov.online/about-us"
        }
      ]
    };

    // Remove only OUR schema scripts to avoid nuking others
    document.querySelectorAll('script[data-schema="userpov"]').forEach(el => el.remove());

    // Add new schemas
    [organizationSchema, websiteSchema, breadcrumbList, navigationSchema].forEach((schema, idx) => {
      const script = document.createElement("script");
      script.setAttribute("type", "application/ld+json");
      script.setAttribute("data-schema", "userpov");
      script.setAttribute("id", `schema-userpov-${idx}`);
      script.innerHTML = JSON.stringify(schema);
      document.head.appendChild(script);
    });

  }, [title, description, keywords, ogImage, ogType]);

  return null;
};
