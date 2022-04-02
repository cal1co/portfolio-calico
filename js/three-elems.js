import '../css/style.css'
import * as THREE from 'three'
import gsap from 'gsap'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import $ from 'jquery'


// Cursor
const cursor = {
    x: 0,
    y: 0
}
window.addEventListener('mousemove', (e) => {
    cursor.x = e.clientX / sizes.width - 0.5
    cursor.y = -(e.clientY / sizes.height - 0.5)
})




// THREE WORLD
const canvas = document.querySelector('canvas.world')
const params = {
    sky:{
        day:'#ffffff',
        // night:'#080C17'
        night:'#080C17'
        // night:'#3D4259'
    }, 
    planet:{
        // day:'0x3BF560',
        day:'#eeaaff',
        // night:
    }
}

// Scene
const scene = new THREE.Scene()
scene.background = new THREE.Color(params.sky.day)

/**
 * Object
 */
const geometry = new THREE.SphereGeometry(2, 128, 64)
// const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshToonMaterial({ color: params.planet.day, wireframe:true })
const mesh = new THREE.Mesh(geometry, material)
mesh.position.y = -2
scene.add(mesh)

const light = new THREE.AmbientLight()
scene.add(light)

const sizes = {
    width: window.innerWidth * 0.45,
    // height: window.innerHeight * 0.50
    height: 10
}

window.addEventListener('resize', () => {
    
    // Update sizes
    sizes.width = window.innerWidth * 0.9
    sizes.height = window.innerHeight * 0.50
    // Update camera 
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()
    renderer.setSize(sizes.width, sizes.height)
})


const camera = new THREE.PerspectiveCamera(20, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 2.5
// camera.position.y = 2
scene.add(camera)


// const controls = new OrbitControls(camera, canvas)
// controls.enableDamping = true



const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))



const clock = new THREE.Clock()


canvas.addEventListener('dblclick', () => {

    const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement

    if(!fullscreenElement)
    {
        if(canvas.requestFullscreen)
        {
            canvas.requestFullscreen()
        }
        else if(canvas.webkitRequestFullscreen)
        {
            canvas.webkitRequestFullscreen()
        }
    }
    else
    {
        if(document.exitFullscreen)
        {
            document.exitFullscreen()
        }
        else if(document.webkitExitFullscreen)
        {
            document.webkitExitFullscreen()
        }
    }


})


gsap.fromTo('nav', {opacity:0}, {opacity:0.9, duration:2})
// gsap.fromTo('.about', {opacity:0}, {opacity:1, duration:2})
// gsap.fromTo('.header-container', {opacity:0}, {opacity:.9, duration:3})



let canvasActive = false
$('canvas').on('mouseover', function(){
    canvasActive = true
})
$('canvas').on('mouseleave', function(){
    canvasActive = false
})

const contactCursor = {
    x:0,
    y:0
}
const butt = $(".contact-butt")
const card = $(".business-card")
// card.on('mousemove', function(e){
//     contactCursor.x = e.clientX / card.width() * 10
//     contactCursor.y = e.clientY / card.height() * 5
//     butt.css({left:contactCursor.x, top:contactCursor.y})
// })



// window.addEventListener('mousemove', (e) => {
//     cursor.x = e.clientX / sizes.width - 0.5
//     cursor.y = -(e.clientY / sizes.height - 0.5)
// })

const animation = () => {
    
    // Page load size
    renderer.setSize(sizes.width, sizes.height)
    if (sizes.height < window.innerHeight * 0.50){
        sizes.height = sizes.height += 10
        camera.aspect = sizes.width / sizes.height
        camera.updateProjectionMatrix()

    } 
    else if (sizes.width < window.innerWidth * 0.9){
        sizes.width = sizes.width += 12
        camera.aspect = sizes.width / sizes.height
        camera.updateProjectionMatrix()
    }
    if (canvasActive){
        camera.position.x = cursor.x / 10
        camera.position.y = cursor.y / 20
    } 

    // const elapsedTime = clock.getElapsedTime()

    // Render
    renderer.render(scene, camera)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    // Contact Butt



    requestAnimationFrame(animation)


}
animation()


// DARK MODE 

let sun = true
$(".go-up").on('click', function(){
    if (sun){
        $(this).children().removeClass('moon-sun')
        $(this).children().addClass('sun-moon')
        darkmode(true)
        sun = false
    } 
    else{
        $(this).children().removeClass('sun-moon')
        $(this).children().addClass('moon-sun')
        darkmode(false)
        sun = true
    }

})
let darkmode = (env) => {
    if (env){ // from light
        $('body').addClass('dark-body')
        $('.nav-butt').css('color', 'white')
        $(".go-up").css('background-color', 'white')
        $('nav').css('background', 'black')
        $(".skill").css('background-color', 'slateblue')
        $(".project").css('background-color', 'slateblue')
        butt.css('color', 'white')
        document.documentElement.style.setProperty('--underline', '#787AEB')
        scene.background = new THREE.Color(params.sky.night)
    } else { // from dark
        $('body').removeClass('dark-body')
        $('.nav-butt').css('color', 'black')
        $('nav').css('background', 'white')
        $(".skill").css('background-color', 'white')
        $(".project").css('background-color', 'white')
        butt.css('color', 'black')
        document.documentElement.style.setProperty('--underline', '#7D9FF5')
        scene.background = new THREE.Color(params.sky.day)
    }
}






