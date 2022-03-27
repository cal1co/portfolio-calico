import './style.css'
import * as THREE from 'three'
import gsap from 'gsap'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'


const canvas = document.querySelector('canvas.world')
const params = {
    sky:{
        day:'#49C5F5',
        night:'#000000'
    } 
}

// Scene
const scene = new THREE.Scene()

scene.background = new THREE.Color(params.sky.day)


/**
 * Object
 */
const geometry = new THREE.SphereGeometry(2, 128, 64)
const material = new THREE.MeshToonMaterial({ color: 0x3BF560 })
const mesh = new THREE.Mesh(geometry, material)
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





const camera = new THREE.PerspectiveCamera(25, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 2.5
camera.position.y = 2
scene.add(camera)


// const controls = new OrbitControls(camera, canvas)
// controls.enableDamping = true



const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))



const clock = new THREE.Clock()


// canvas.addEventListener('dblclick', () => {

//     const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement

//     if(!fullscreenElement)
//     {
//         if(canvas.requestFullscreen)
//         {
//             canvas.requestFullscreen()
//         }
//         else if(canvas.webkitRequestFullscreen)
//         {
//             canvas.webkitRequestFullscreen()
//         }
//     }
//     else
//     {
//         if(document.exitFullscreen)
//         {
//             document.exitFullscreen()
//         }
//         else if(document.webkitExitFullscreen)
//         {
//             document.webkitExitFullscreen()
//         }
//     }


// })




gsap.fromTo('nav', {opacity:0}, {opacity:0.5, duration:2})
const animation = () => {
    renderer.setSize(sizes.width, sizes.height)
    
    if (sizes.height < window.innerHeight * 0.50){
        sizes.height = sizes.height += 5
        camera.aspect = sizes.width / sizes.height
        camera.updateProjectionMatrix()

    } 
    else if (sizes.width < window.innerWidth * 0.9){
        sizes.width = sizes.width += 6
        camera.aspect = sizes.width / sizes.height
        camera.updateProjectionMatrix()
    }


    const elapsedTime = clock.getElapsedTime()
    


    // controls.update()

    // Render
    renderer.render(scene, camera)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    requestAnimationFrame(animation)


}
animation()


console.log(THREE)