// Interactive JavaScript for the web page
document.addEventListener('DOMContentLoaded', function() {
    // Add a click handler to the main heading
    const heading = document.querySelector('h1');
    if (heading) {
        heading.addEventListener('click', function() {
            this.style.color = this.style.color === 'red' ? '#2c3e50' : 'red';
        });
    }
    
    // Add a button to show/hide the about section
    const aboutSection = document.querySelector('div');
    if (aboutSection) {
        const toggleButton = document.createElement('button');
        toggleButton.textContent = 'Toggle About Section';
        toggleButton.style.marginTop = '20px';
        toggleButton.style.padding = '10px 20px';
        toggleButton.style.backgroundColor = '#3498db';
        toggleButton.style.color = 'white';
        toggleButton.style.border = 'none';
        toggleButton.style.borderRadius = '5px';
        toggleButton.style.cursor = 'pointer';
        
        toggleButton.addEventListener('click', function() {
            aboutSection.style.display = 
                aboutSection.style.display === 'none' ? 'block' : 'none';
        });
        
        document.body.appendChild(toggleButton);
    }
    
    // Add some console logging
    console.log('Web page loaded successfully!');
    console.log('Interactive features enabled');
});
