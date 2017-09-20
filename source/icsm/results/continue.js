{

   angular.module("elvis.results.continue", [])

      .directive('icsmSearchContinue', ['continueService', function (continueService) {
         return {
            templateUrl: 'icsm/results/continue.html',
            controller: 'listCtrl',
            controllerAs: 'ctrl',
            link: function (scope, element) {
               scope.data = continueService.data;
            }
         };
      }])

      .factory('continueService', ['listService', function (listService) {
         var service = {};
         service.data = listService.data;
         return service;
      }])

      .filter("someSelected", function () {
         return function (products) {
            return products && products.some(item => item.selected);
         };
      })

      .filter("countSelected", function () {
         return function (products) {
            return products?products.filter(item => item.selected).length: '';
         };
      });
}