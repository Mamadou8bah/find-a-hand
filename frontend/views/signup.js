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
                alert('Registration Succesful')
                localStorage.setItem('token',result.token)
                window.location.href = './search-handyman.html'
            }else{
                 errorPage.innerText=result.message ||"Failed to Create Account"
            }
        }catch(error){
             errorPage.innerText="Error "+error.message

        }
    }

})