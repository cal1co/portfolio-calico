import $ from 'jquery'
console.log('helooooo', $)

$(window).scroll(function(){
    let endLine = $(window).scrollTop() - 60
    if ($("#about").offset().top > endLine){
        $(".nav-about").children().addClass('selected')
        $(".nav-skills").children().removeClass('selected')
        $(".nav-projects").children().removeClass('selected')
        $(".nav-contact").children().removeClass('selected')
    } else if ($("#skills").offset().top > endLine) {
        $(".nav-about").children().removeClass('selected')
        $(".nav-skills").children().addClass('selected')
        $(".nav-projects").children().removeClass('selected')
        $(".nav-contact").children().removeClass('selected')
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
