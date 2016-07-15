angular.module('testUtil')
.factory('DomHelper', function(
) {

  return function(root) {
    return {
      el: root,
      clickButton: function(el) {
        root.find(el).click()
      },
      findText: function(el) {
        return root.find(el).text()
      }
    }
  }

})
