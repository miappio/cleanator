angular.module('srvArray', [])

    .factory('srvArray', function () {
        return new srvArray();
    });

var srvArray = (function () {

    return {
        deleteElement: function (array, element) {
            var index = array.indexOf(element);

            if (index == -1) {
                return false;
            }

            array.splice(index, 1);
        },
        moveElementUp: function (array, element) {
            var index = array.indexOf(element);

            // Item non-existent?
            if (index == -1) {
                return false;
            }

            // If there is a previous element in sections
            if (array[index - 1]) {
                // Swap elements
                array.splice(index - 1, 2, array[index], array[index - 1]);
            } else {
                // Do nothing
                return 0;
            }
        },
        moveElementDown: function (array, element) {
            var index = array.indexOf(element);

            // Item non-existent?
            if (index == -1) {
                return false;
            }

            // If there is a next element in sections
            if (array[index + 1]) {
                // Swap elements
                array.splice(index, 2, array[index + 1], array[index]);
            } else {
                // Do nothing
                return 0;
            }
        },
        moveByIndex: function (array, old_index, new_index) {
            while (old_index < 0) {
                old_index += array.length;
            }
            while (new_index < 0) {
                new_index += array.length;
            }
            if (new_index >= array.length) {
                var k = new_index - array.length;
                while ((k--) + 1) {
                    array.push(undefined);
                }
            }
            array.splice(new_index, 0, array.splice(old_index, 1)[0]);
        },
        find: function (array, compareFn) {

            var found;
            for (var i = 0; (i < array.length) && !found; i++) {
                var element = array[i];
                if (compareFn(element)) {
                    found = element;
                    //console.log('found :', i, found);
                }
            }
            return found;
        }

    }
});