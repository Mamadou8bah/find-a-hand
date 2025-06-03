class formValidator{
    constructor(){
        this.form=document.getElementById('booking-form');
        this.fields={
            task:document.getElementById('task'),
            date:document.getElementById('date'),
            time:document.getElementById('time'),
            phone:document.getElementById('phone'),
            service:document.getElementById('service'),
            location:document.getElementById('location')
        };
        this.errors={
            
        }
    }
}
    const shareLocation=document.getElementById('share-location')
    
    shareLocation.addEventListener('click', () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            document.getElementById('location').value = `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`;
          },
          (error) => {
            alert('Unable to retrieve location.');
          }
        );
      } else {
        alert('Geolocation is not supported by your browser.');
      }
    });