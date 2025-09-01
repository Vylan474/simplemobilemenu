const fs = require('fs').promises;
const path = require('path');

// This creates a dynamic route at /menu/[slug] for Vercel
export async function getServerSideProps({ params }) {
  const { slug } = params;
  
  // Validate slug format
  if (!slug || !/^[a-z0-9-]+$/.test(slug) || slug.length < 3 || slug.length > 50) {
    return {
      notFound: true,
    };
  }

  try {
    // Read the published-menu.html file
    const htmlPath = path.join(process.cwd(), 'published-menu.html');
    const publishedMenuHTML = await fs.readFile(htmlPath, 'utf8');
    
    // Replace the placeholder with the actual slug
    const customizedHTML = publishedMenuHTML.replace('{{MENU_SLUG}}', slug);
    
    return {
      props: {
        html: customizedHTML,
        slug
      },
    };
  } catch (error) {
    console.error('Error loading menu page:', error);
    return {
      notFound: true,
    };
  }
}

export default function MenuPage({ html, slug }) {
  return (
    <div dangerouslySetInnerHTML={{ __html: html }} />
  );
}