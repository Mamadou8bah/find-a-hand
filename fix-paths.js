const fs = require('fs');
const path = require('path');

// Function to fix paths in HTML files
function fixPaths() {
  const viewsDir = path.join(__dirname, 'frontend', 'views');
  const files = fs.readdirSync(viewsDir).filter(file => file.endsWith('.html'));
  
  files.forEach(file => {
    const filePath = path.join(viewsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix CSS paths
    content = content.replace(/href="\.\.\/public\/css\//g, 'href="public/css/');
    
    // Fix image paths
    content = content.replace(/src="\.\.\/public\/images\//g, 'src="public/images/');
    
    // Fix JavaScript paths
    content = content.replace(/src="\.\.\/public\/js\//g, 'src="public/js/');
    
    // Write back the fixed content
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed paths in ${file}`);
  });
}

fixPaths();
console.log('🎉 All file paths have been fixed for Netlify deployment!'); 