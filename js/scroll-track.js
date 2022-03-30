import $ from 'jquery'

$(window).scroll(function(){
    let endLine = $(window).scrollTop() - 60
    if ($("#about").offset().top > endLine){
        $(".nav-about").children().addClass('selected')
        $(".nav-skills").children().removeClass('selected')
        $(".nav-projects").children().removeClass('selected')
        $(".nav-contact").children().removeClass('selected')
        // $(".about-me").addClass('drop')  
    
    } else if ($("#skills").offset().top > endLine) {
        $(".nav-about").children().removeClass('selected')
        $(".nav-skills").children().addClass('selected')
        $(".nav-projects").children().removeClass('selected')
        $(".nav-contact").children().removeClass('selected')
        // $(".my-skills").addClass('drop')
        // $(".my-projects").addClass('drop')
        $(".html").addClass("drop1")
        $(".rails").addClass("drop1")
        $(".express").addClass("drop1")
        $(".heroku").addClass("drop1")

        $(".css").addClass("drop2")
        $(".jquery").addClass("drop2")
        $(".node").addClass("drop2")
        $(".git").addClass("drop2")

        $(".javascript").addClass("drop3")
        $(".react").addClass("drop3")
        $(".three").addClass("drop3")
        $(".github").addClass("drop3")

        $(".ruby").addClass("drop4")
        $(".vue").addClass("drop4")
        $(".go").addClass("drop4")
        $(".netlify").addClass("drop4")

        $(".mongo").addClass("drop5")
        $(".postgres").addClass("drop5")


        // $(".html").addClass("drop1")
    } else if ($("#projects").offset().top > endLine) {
        $(".nav-about").children().removeClass('selected')
        $(".nav-skills").children().removeClass('selected')
        $(".nav-projects").children().addClass('selected')
        $(".nav-contact").children().removeClass('selected')
        

    } else if ($("#contact").offset().top > endLine) {
        $(".nav-about").children().removeClass('selected')
        $(".nav-skills").children().removeClass('selected')
        $(".nav-projects").children().removeClass('selected')
        $(".nav-contact").children().addClass('selected')
    }
})

$(".tsuru").on('click', function(){
    window.open("https://blissful-borg-f2769c.netlify.app/", '_blank')
})
$(".tsuru-repo").on('click', function(){
    window.open('https://github.com/cal1co/tsuru-lingo-front-end', '_blank')
})
$(".odd").on('click', function(){
    window.open("https://spy-fall-clone.netlify.app/#/", '_blank')
})
$(".odd-repo").on('click', function(){
    window.open('https://github.com/azhang-dev/quiplash-frontend', '_blank')
})
$(".rev").on('click', function(){
    window.open("https://cryptic-citadel-69958.herokuapp.com/users/new", '_blank')
})
$(".rev-repo").on('click', function(){
    window.open('https://github.com/cal1co/reviewr', '_blank')
})
$(".ttt").on('click', function(){
    window.open("https://cal1co.github.io/tic-tac-toe/", '_blank')
})
$(".ttt-repo").on('click', function(){
    window.open('https://github.com/cal1co/tic-tac-toe', '_blank')
})