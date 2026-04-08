import os
from string import Template

segments = {
    'gkc': '35th GKC',
    'wallmagazine': 'Wall Magazine',
    'digitalposter': 'Digital Poster Designing',
    'scrapbook': 'Scrapbook',
    'conceptualart': 'Conceptual Art',
    'videography': 'Videography',
    'scienceolympiad': 'Fr Timm Memorial Science Olympiad',
    'scifiwriting': 'Sci-Fi Story Writing',
    'scinimequiz': 'Sci-Nime Quiz',
    'extempore': 'Extempore Speech',
    'rubikscube': "Rubik's Cube Solving",
    'conundrumparadox': 'Conundrum Paradox',
    'robosoccer': 'Robo Soccer',
    'linefollower': 'Line Following Robot',
    'googleit': 'Google It',
    'webdesign': 'Web Page Designing',
    'publicquiz': 'Public Quiz',
    'teamquiz': 'Team Based Quiz',
    'soloquiz': 'Solo Quiz',
    'oldschoolquiz': 'Old School Quiz'
}

html_template = Template("""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>$name Registration — NDSC 2026</title>

<link rel="stylesheet" href="../css/common.css"/>
<link rel="stylesheet" href="../css/pages.css"/>

<style>
.reg-container { max-width: 500px; margin: 80px auto; text-align: center; }

.identity-box {
background: var(--bg-raised);
padding: 20px;
border-radius: var(--radius-m);
border: 1px solid var(--border-subtle);
margin: 32px 0;
}

.identity-box p {
font-size: 0.8rem;
color: var(--text-muted);
text-transform: uppercase;
letter-spacing: 1px;
}

.identity-box h3 {
margin-top: 5px;
color: var(--violet-200);
}
</style>
</head>

<body>

<canvas id="particleCanvas"></canvas>

<main class="page-enter">

<div class="container">

<div class="reg-container">

<div class="eyebrow">Event Enrollment</div>

<h1 class="section-title">$name</h1>

<p class="section-body">Complete registration for <strong>$name</strong></p>


<div class="identity-box">

<p>Registering As</p>

<h3 id="userName">Verifying...</h3>

<small id="userEmail" style="opacity:0.6;"></small>

</div>


<div style="display:flex; flex-direction:column; gap:16px;">

<button id="enrollBtn"
class="btn btn--primary"
style="width:100%; justify-content:center; height:56px; font-size:1.1rem;">
Confirm Enrollment
</button>

<a href="../dashboard.html"
class="btn btn--ghost"
style="width:100%; justify-content:center;">
Return to Dashboard
</a>

</div>

<p id="statusMsg"
style="margin-top:20px; font-size:0.9rem; min-height:1.2em;"></p>

</div>

</div>

</main>

<script src="../js/common.js"></script>

<script>

(async function(){

const btn = document.getElementById('enrollBtn');
const status = document.getElementById('statusMsg');

let userData = null;

try{

const res = await fetch('/api/dashboard');
const json = await res.json();

if(!json.ok) throw new Error();

userData = json.data.user;

document.getElementById('userName').textContent =
userData.full_name;

document.getElementById('userEmail').textContent =
userData.email;

}catch(e){

window.location.href = '../login.html';

}


btn.addEventListener('click', async ()=>{

btn.disabled = true;
btn.textContent = 'Registering...';
status.textContent = '';

try{

const response = await fetch('/api/register/$slug',{

method:'POST',

headers:{'Content-Type':'application/json'},

body: JSON.stringify({

user_id: userData.id,
full_name: userData.full_name,
email: userData.email

})

});


const result = await response.json();


if(result.ok){

status.style.color = '#10b981';
status.textContent = 'Successfully enrolled in $name!';

setTimeout(()=>{

window.location.href='../dashboard.html';

},1500);

}else{

throw new Error(result.message || 'Enrollment failed');

}


}catch(err){

status.style.color = '#ef4444';
status.textContent = err.message;

btn.disabled = false;
btn.textContent = 'Try Again';

}

});

})();

</script>

</body>
</html>
""")

# Create pages
for slug, name in segments.items():

    filename = f"{slug}.html"

    content = html_template.substitute(
        slug=slug,
        name=name
    )

    with open(filename, "w", encoding="utf-8") as f:
        f.write(content)

    print("Created:", filename)