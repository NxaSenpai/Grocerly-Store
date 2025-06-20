// tailwind.config.js 

module.exports = {
    content: [],
    theme: {
      extend: {
        backgroundImage: theme => ({
          'gradient-to-45': 
              'linear-gradient(45deg, #ffed4a, #ff3860)',
          'gradient-to-135': 
              'linear-gradient(135deg, #ffed4a, #ff3860)',
          // You can add more custom classes here
        })
      },
    },
    plugins: [],
  }

  bg-gradient-to-b from-green-600 to-yellow-800;