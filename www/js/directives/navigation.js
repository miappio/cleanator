

angular.module('myAngularApp.directives.navigation', [])
.directive('appVersion', function(appName, appVersion) {
      return function(scope, elm, attrs) {
          elm.text(appName+'.'+appVersion);
      };
})
.directive('mleAnimateshow', function($animate) {
  return {
    scope: {
      'mleAnimateshow': '=',
      'afterShow': '&',
      'afterHide': '&'
    },
    link: function(scope, element) {
      scope.$watch('mleAnimateshow', function(show, oldShow) {
        if (show) {
          $animate.removeClass(element, 'ng-hide').then(scope.afterShow);
        }
        if (show === false) {
          $animate.addClass(element, 'ng-hide').then(scope.afterHide);
        }
      });
    }
  };
})
.directive('mleSvgAnimate',function(version) {
  return {
    scope: {},
    link: function(scope, element) {

        var svg = element[0];
        var svgDoc = svg.contentDocument;
        var circle = svgDoc.getElementById("bottom-jaw");
        circle.setAttributeNS(null, "cx", 200);
        //circle.setAttributeNS(null, "c" + direction, value * 5);

    }
  };


})
.directive("mleSvgStatus", function() {
  return {
    restrict: "E",
    replace: true,
    template: "<object type='image/svg+xml' data='images/mascot.svg'></object>",
    link: function(scope, element, attrs) {
      return;
      //var statusChanged = function(newValue, oldValue) {
      var init = function() {
        var svg = element[0];
        var svgDoc = svg.contentDocument;
        var statusElm = svgDoc.getElementById("bottom-jaw");

        //var statusElm = angular.element(element[0]
        //  .getSVGDocument().getElementById("bottom-jaw"));
        if (statusElm) statusElm.setAttributeNS(null, "cx", 200);
    //  };
      //scope.$watch(attrs.watch, statusChanged);
      //statusChanged('red','black');
      };
      if (element[0].contentDocument) {
        init();
      } else {
        element.on("load", init);
      }
    }
  };
})
.directive('mleInputInteger',function() {
    return {
      restrict: 'AE',
      require: 'ngModel',
      scope: {
        min: '=',
        max: '=',
        ngModel: '='
      },
      //template: '<button type="button" ng-disabled="isOverMin()" ng-click="decrement()">-</button>' +
      //'<input type="text" ng-model="ngModel">' +
      //'<button type="button" ng-disabled="isOverMax()" ng-click="increment()">+</button>',
      template: '<div class="input-group">' +
      '  <a class="input-group-addon btn btn-primary" ng-disabled="isOverMin()" ng-click="decrement()">-</a>' +
      '  <input type="text" class="form-control" ng-model="ngModel" placeholder="Todo set0" style="background-color: white;text-align: center;" readonly>' +
      '  <a class="input-group-addon btn btn-primary" ng-disabled="isOverMax()" ng-click="increment()">+</a>' +
      '</div>',

      link: function(scope, iElement, iAttrs, ngModelController) {

        //scope.label = '';
        //if (angular.isDefined(iAttrs.label)) {
        //  iAttrs.$observe('label', function(value) {
        //    scope.label = ' ' + value;
        //    ngModelController.$render();
        //  });
        //}

        ngModelController.$render = function() {
          // update the validation status
          checkValidity();
        };

        // when model change, cast to integer
        ngModelController.$formatters.push(function(value) {
          return parseInt(value, 10);
        });

        // when view change, cast to integer
        ngModelController.$parsers.push(function(value) {
          return parseInt(value, 10);
        });

        function checkValidity() {
          // check if min/max defined to check validity
          var valid = !(scope.isOverMin(true) || scope.isOverMax(true));
          // set our model validity
          // the outOfBounds is an arbitrary key for the error.
          // will be used to generate the CSS class names for the errors
          ngModelController.$setValidity('outOfBounds', valid);
        }

        function updateModel(offset) {
          // update the model, call $parsers pipeline...
          ngModelController.$setViewValue(ngModelController.$viewValue + offset);
          // update the local view
          ngModelController.$render();
        }

        scope.isOverMin = function(strict) {
          var offset = strict?0:1;
          return (angular.isDefined(scope.min) && (ngModelController.$viewValue - offset) < parseInt(scope.min, 10));
        };
        scope.isOverMax = function(strict) {
          var offset = strict?0:1;
          return (angular.isDefined(scope.max) && (ngModelController.$viewValue + offset) > parseInt(scope.max, 10));
        };


        // update the value when user clicks the buttons
        scope.increment = function() {
          updateModel(+1);
        };
        scope.decrement = function() {
          updateModel(-1);
        };

        // check validity on start, in case we're directly out of bounds
        checkValidity();

        // watch out min/max and recheck validity when they change
        scope.$watch('min+max', function() {
          checkValidity();
        });
      }
    };
});
