import $ from 'jquery'

$(window).scroll(function(){
    let endLine = $(window).scrollTop() - (window.innerHeight/10)
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
    } else if (($("#projects").offset().top + (window.innerHeight))> endLine) {
        $(".nav-about").children().removeClass('selected')
        $(".nav-skills").children().removeClass('selected')
        $(".nav-projects").children().addClass('selected')
        $(".nav-contact").children().removeClass('selected')

    } else if ($("#contact").position().top > endLine) {
        $(".nav-about").children().removeClass('selected')
        $(".nav-skills").children().removeClass('selected')
        $(".nav-projects").children().removeClass('selected')
        $(".nav-contact").children().addClass('selected')
    } 
    if ($(".proj1").offset().top / 1.2 > endLine){
        $(".proj1").addClass('drop')
    } else if ($(".proj2").offset().top / 1.2 > endLine){
        $(".proj2").addClass('drop')
    } else if ($(".proj3").offset().top / 1.2  > endLine){
        $(".proj3").addClass('drop')
    } else if ($(".proj4").offset().top / 1.2  > endLine){
        $(".proj4").addClass('drop')
    } else if ($(".proj5").offset().top / 1.2  > endLine){
        $(".proj5").addClass('drop')
    } else if ($(".proj6").offset().top / 1.2  > endLine){
        $(".proj6").addClass('drop')
    } else if ($(".proj7").offset().top / 1.2  > endLine){
        $(".proj7").addClass('drop')
    } else if ($(".proj8").offset().top / 1.2  > endLine){
        $(".proj8").addClass('drop')
    } else if ($(".proj9").offset().top / 1.2  > endLine){
        $(".proj9").addClass('drop')
    } else if ($(".proj10").offset().top / 1.2  > endLine){
        $(".proj9").addClass('drop')
    }
})



$(".jpi").on('click', function(){
    window.open("https://github.com/cal1co/jpi", '_blank')
})
$(".jpi-repo").on('click', function(){
    window.open("https://github.com/cal1co/jpi", '_blank')
})
$(".pyg").on('click', function(){
    window.open("https://github.com/cal1co/py-rpg", '_blank')
})
$(".pyg-repo").on('click', function(){
    window.open("https://github.com/cal1co/py-rpg", '_blank')
})
$(".alg").on('click', function(){
    window.open("https://algo-vis-tool.netlify.app/", '_blank')
})
$(".alg-repo").on('click', function(){
    window.open("https://github.com/cal1co/algo-vis", '_blank')
})
$(".mov").on('click', function(){
    window.open("https://my-movies-client.netlify.app/", '_blank')
})
$(".mov-repo").on('click', function(){
    window.open("https://github.com/cal1co/my-movies-client", '_blank')
})
$(".con").on('click', function(){
    window.open("https://github.com/cal1co/cli-connect-4", '_blank')
})
$(".con-repo").on('click', function(){
    window.open("https://github.com/cal1co/cli-connect-4", '_blank')
})
$(".todo").on('click', function(){
    window.open("https://github.com/cal1co/GO-CLI-TODO", '_blank')
})
$(".todo-repo").on('click', function(){
    window.open("https://github.com/cal1co/GO-CLI-TODO", '_blank')
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
$(".contact-git").on('click', function(){
    window.open('https://github.com/cal1co', '_blank')
})
$(".linkedin").on('click', function(){
    window.open('https://www.linkedin.com/in/alex-king2/', '_blank')
})
$(".twitter").on('click', function(){
    window.open('https://www.twitter.com/8CAL1CO', '_blank')
})