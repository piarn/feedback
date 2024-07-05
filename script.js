document.addEventListener('DOMContentLoaded', function() {
    // Fetch 'agent' and 'rating' values from URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const agent = urlParams.get('agent');
    const ratingParam = urlParams.get('rating');
    
    // Select the form, submit button, and rating input
    const feedbackForm = document.getElementById('feedbackForm');
    const submitButton = document.getElementById('submitButton');
    const ratingInput = document.getElementById('rating');
  
    // Set the initial value of the rating input based on 'rating' query parameter
    if (ratingParam) {
      ratingInput.value = ratingParam;
    }
  
    // Add event listener to submit button
    submitButton.addEventListener('click', function(event) {
      event.preventDefault(); // Prevent default form submission
  
      // Get form data
      const email = feedbackForm.elements.email.value;
      const rating = ratingInput.value; // Get the current value of the rating input
      const message = feedbackForm.elements.message.value;
  
      // Create JSON object with form data and agent
      const formData = {
        email: email,
        rating: rating,
        message: message,
        agent: agent // Include 'agent' from URL query parameter
      };
  
  
      // Send JSON data to server using fetch API
      fetch('/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      .then(response => {
        if (response.ok) {
          alert('Feedback submitted successfully!');
          // Optionally, reset the form
          feedbackForm.reset();
        } else {
          alert('Error submitting feedback!');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Error submitting feedback!');
      });
    });
  });
  