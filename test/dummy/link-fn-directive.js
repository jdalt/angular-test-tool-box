angular.module('dummy')
.directive('linkFnDirective', function(
  $document
) {

  return {
    restrict: 'A',
    scope: {},
    template: '\n<div id="main"></div>\n',
    link: function(scope, element, attr) {
      var el = element[0]

      // Element Events
      element.on('mousedown', function(event) {
        element.prepend('<span>Element Mouse Down at ' + event.clientX + ',' + event.clientY + '</span>')
      })

      element.on('mousemove', function(event) {
        element.prepend('<span>Element Mouse Move at ' + event.clientX + ',' + event.clientY + '</span>')
        if(event.shiftKey) element.prepend('<sel>Top Gear!</sel>')
      })

      // Document Events
      $document.on('mousedown', function(event) {
        element.prepend('<span>Document Mouse Down at ' + event.clientX + ',' + event.clientY + '</span>')
      })

      $document.on('mousemove', function(event) {
        element.prepend('<span>Document Mouse Move at ' + event.clientX + ',' + event.clientY + '</span>')
      })
    }
  }

})
