document.getElementById('signup-form').addEventListener('submit',async (e)=>{
    e.preventDefault();

    const firstName=document.getElementById('first-name').value.trim()
    const lastName=document.getElementById('last-name').value.trim()
    const email=document.getElementById('email').value.trim()
    const phone=document.getElementById('phone').value.trim()
    const location=document.getElementById('location').value.trim()
    const password=document.getElementById('password').value.trim();
    const confirmpassword=document.getElementById('confirm-password').value.trim();
    const errorPage=document.getElementById('errorPage')

    let isvalid=true;

    if(password!=confirmpassword){
        isvalid=false;
        errorPage.innerText="Passwords do not match"
        errorPage.style.color='red'
    }

    if(isvalid){
        const data={
            firstName:firstName,
            lastName:lastName,
            email:email,
            phone:phone,
            location:location,
            password:password
        }

        try{
            const response=await fetch('http://localhost:5000/api/users/register',{
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify(data)
            })

            const result=await response.json();

            if(response.ok){
                alert('Registration Successful')
                localStorage.setItem('token',result.token)
                
                // Get user profile
                const userRes = await fetch('http://localhost:5000/api/users/profile', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${result.token}`
                    }
                });

                if (userRes.ok) {
                    const userData = await userRes.json();
                    localStorage.setItem('user', JSON.stringify(userData));
                }

                // Check for pending handyman booking
                const pendingHandyman = localStorage.getItem('pendingHandyman');
                const redirectUrl = localStorage.getItem('redirectAfterLogin');
                
                // Clear redirect info
                localStorage.removeItem('redirectAfterLogin');
                localStorage.removeItem('pendingHandyman');

                // If there was a pending handyman booking, restore it
                if (pendingHandyman) {
                    try {
                        const handyman = JSON.parse(pendingHandyman);
                        localStorage.setItem('handyman', JSON.stringify(handyman));
                    } catch (error) {
                        console.error('Error parsing pending handyman:', error);
                    }
                }

                // Redirect to the original URL or booking page
                if (redirectUrl) {
                    window.location.href = redirectUrl;
                } else if (pendingHandyman) {
                    // If there was a pending booking, go to booking page
                    window.location.href = './booking.html';
                } else {
                    window.location.href = './search-handyman.html';
                }
            }else{
                 errorPage.innerText=result.message ||"Failed to Create Account"
            }
        }catch(error){
             errorPage.innerText="Error "+error.message
        }
    }
})