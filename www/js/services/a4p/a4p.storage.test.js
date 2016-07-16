
describe('a4p', function () {
'use strict';


    describe('LocalStorage', function () {

        describe('with default storage', function () {

            var LocalStorage = null;
            var fs = null;
            beforeEach(function () {

                LocalStorage = new a4p.LocalStorageFactory();
                fs = new LocalStorage();

            });

            it('should be not null', function () {

                expect(fs).not.toBeNull();

            });

            it('should set a string item', function () {

                fs.clear();
                expect(fs.size()).toBe(0);

                var v = fs.set('a', 'v');

                expect(v).toEqual('{"string":"v"}');
                expect(fs.size()).toBe(1);

                v = fs.get('a', 'default');
                expect(v).toBe('v');

                v = fs.remove('a');
                expect(v).toBe(true);
                expect(fs.size()).toBe(0);

                v = fs.remove('a');
                expect(v).toBe(false);

            });

            it('should set a number item', function () {

                fs.clear();
                expect(fs.size()).toBe(0);

                var v = fs.set('a', 15);

                expect(v).toEqual('{"number":15}');
                expect(fs.size()).toBe(1);

                v = fs.get('a', 'default');
                expect(v).toBe(15);

                v = fs.clear();
                expect(v).toBe(true);
                expect(fs.size()).toBe(0);

                v = fs.clear();
                expect(v).toBe(false);

            });

            it('should set a boolean item', function () {

                fs.clear();
                expect(fs.size()).toBe(0);

                var v = fs.set('a', true);

                expect(v).toEqual('{"bool":true}');
                expect(fs.size()).toBe(1);

                v = fs.get('a', 'default');
                expect(v).toBe(true);

            });

            it('should set an object item', function () {

                fs.clear();
                expect(fs.size()).toBe(0);

                var v = fs.set('a', {a:1, b:"s"});

                expect(v).toEqual('{"json":{"a":1,"b":"s"}}');
                expect(fs.size()).toBe(1);

                v = fs.get('a', 'default');
                expect(v.a).toBe(1);
                expect(v.b).toBe('s');

            });

            it('should set an XML item', function () {

                fs.clear();
                expect(fs.size()).toBe(0);

                var xml = a4p.Xml.string2Xml('<span><div><p/></div></span>');
                var v = fs.set('a', xml);

                expect(v).toEqual('{"xml":"<span><div><p/></div></span>"}');
                expect(fs.size()).toBe(1);

                v = fs.get('a', 'default');

                expect(v).not.toBeNull();
                expect(a4p.Xml.xml2String(v)).toEqual('<span><div><p/></div></span>');

            });

            it('should set null value', function () {

                fs.clear();
                expect(fs.size()).toBe(0);

                var v = fs.set('a', null);

                expect(v).toBe('null');
                expect(fs.size()).toBe(1);

                v = fs.get('a', 'default');

                expect(v).toBeNull();

            });

            it('should set undefined value', function () {

                fs.clear();
                expect(fs.size()).toBe(0);

                var u;
                var v = fs.set('a', u);

                expect(typeof(u)).toEqual('undefined');
                expect(v).toBe('null');
                expect(fs.size()).toBe(1);

                v = fs.get('a', 'default');

                expect(v).toBeNull();

            });

            it('should reject function value', function () {

                fs.clear();
                expect(fs.size()).toBe(0);

                var errorMsg;
                var v;
                try {
                    v = fs.set('a', function () {
                        return 1;
                    });
                } catch (e) {
                    errorMsg = e.message;
                }

                expect(errorMsg).toEqual('Value type function is invalid. It must be null, undefined, xml, string, number, boolean or object');

                v = fs.get('a', 'default');

                expect(v).toBe('default');
                expect(fs.size()).toBe(0);

            });

            it('should reject number key', function () {

                fs.clear();
                expect(fs.size()).toBe(0);

                var errorMsg;
                var v;

                try {
                    v = fs.set(2, 'v');
                } catch (e) {
                    errorMsg = e.message;
                }

                expect(errorMsg).toEqual('Key type must be string');
                expect(fs.size()).toBe(0);

                try {
                    errorMsg = null;
                    v = fs.get(2);
                } catch (e) {
                    errorMsg = e.message;
                }

                expect(errorMsg).toEqual('Key type must be string');

            });

            it('should reject boolean key', function () {

                fs.clear();
                expect(fs.size()).toBe(0);

                var errorMsg;
                var v;

                try {
                    v = fs.set(true, 'v');
                } catch (e) {
                    errorMsg = e.message;
                }

                expect(errorMsg).toEqual('Key type must be string');
                expect(fs.size()).toBe(0);

                try {
                    errorMsg = null;
                    v = fs.get(true);
                } catch (e) {
                    errorMsg = e.message;
                }

                expect(errorMsg).toEqual('Key type must be string');

            });

            it('should reject object key', function () {

                fs.clear();
                expect(fs.size()).toBe(0);

                var errorMsg;
                var v;

                try {
                    v = fs.set({a:"a", b:1}, 'v');
                } catch (e) {
                    errorMsg = e.message;
                }

                expect(errorMsg).toEqual('Key type must be string');
                expect(fs.size()).toBe(0);

                try {
                    errorMsg = null;
                    v = fs.get({a:"a", b:1});
                } catch (e) {
                    errorMsg = e.message;
                }

                expect(errorMsg).toEqual('Key type must be string');

            });

            it('should browse all items with instance method', function () {

                function Index() {
                    this.list = [];
                }

                Index.prototype.add = function (n) {
                    this.list.push(n);
                    //console.log('Index.prototype.add '+n);
                };
                Index.prototype.get = function (n) {
                    var val = this.list[n];
                    //console.log('Index.prototype.get '+n);
                    return this.list[n];
                };
                Index.prototype.size = function () {
                    return this.list.length;
                };

                fs.clear();
                expect(fs.size()).toBe(0);

                fs.set('k', '1');
                fs.set('d', '2');
                fs.set('u', '3');

                expect(fs.size()).toBe(3);
                expect(fs.get('k')).toBe('1');
                expect(fs.get('d')).toBe('2');
                expect(fs.get('u')).toBe('3');

                var index = new Index();

                expect(index.size()).toBe(0);

                fs.foreach(Index.prototype.add, index);

                // alphabetical sorted ?
                expect(index.size()).toBe(3);
                expect(index.get(0)).toBe('3');
                expect(index.get(1)).toBe('2');
                expect(index.get(2)).toBe('1');

            });

            it('should browse all items with class method', function () {

                var Index = (function () {
                    var list = [];

                    function Index() {
                    }

                    Index.add = function (n) {
                        list.push(n);
                    };
                    Index.get = function (n) {
                        return list[n];
                    };
                    Index.size = function () {
                        return list.length;
                    };

                    return Index;
                })();

                fs.clear();
                expect(fs.size()).toBe(0);

                fs.set('k', '1');
                fs.set('d', '2');
                fs.set('u', '3');

                expect(fs.size()).toBe(3);
                expect(fs.get('k')).toBe('1');
                expect(fs.get('d')).toBe('2');
                expect(fs.get('u')).toBe('3');
                expect(Index.size()).toBe(0);

                fs.foreach(Index.add);

                // alphabetical sorted ?
                expect(Index.size()).toBe(3);
                expect(Index.get(0)).toBe('3');
                expect(Index.get(1)).toBe('2');
                expect(Index.get(2)).toBe('1');

            });

            it('should browse all items with function', function () {

                var list = [];

                fs.clear();
                expect(fs.size()).toBe(0);

                fs.set('k', '1');
                fs.set('d', '2');
                fs.set('u', '3');

                expect(fs.size()).toBe(3);
                expect(fs.get('k')).toBe('1');
                expect(fs.get('d')).toBe('2');
                expect(fs.get('u')).toBe('3');
                expect(list.length).toBe(0);

                fs.foreach(function (n) {
                    list.push(n);
                });

                // alphabetical sorted ?
                expect(list.length).toBe(3);
                expect(list[0]).toBe('3');
                expect(list[1]).toBe('2');
                expect(list[2]).toBe('1');

            });

        });

        describe('with window storage', function () {

            var LocalStorage = null;
            var fs = null;
            beforeEach(function () {
                LocalStorage = new a4p.LocalStorageFactory(window.localStorage);
                fs = new LocalStorage();
            });

            it('should be not null', function () {

                expect(fs).not.toBeNull();

            });

            it('should set a string item', function () {

                fs.clear();
                expect(fs.size()).toBe(0);

                var v = fs.set('a', 'v');

                expect(v).toEqual('{"string":"v"}');
                expect(fs.size()).toBe(1);

                v = fs.get('a', 'default');
                expect(v).toBe('v');

                v = fs.remove('a');
                expect(v).toBe(true);
                expect(fs.size()).toBe(0);

                v = fs.remove('a');
                expect(v).toBe(false);

            });

            it('should set a number item', function () {

                fs.clear();
                expect(fs.size()).toBe(0);

                var v = fs.set('a', 15);

                expect(v).toEqual('{"number":15}');
                expect(fs.size()).toBe(1);

                v = fs.get('a', 'default');
                expect(v).toBe(15);

                v = fs.clear();
                expect(v).toBe(true);
                expect(fs.size()).toBe(0);

                v = fs.clear();
                expect(v).toBe(false);

            });

            it('should set a boolean item', function () {

                fs.clear();
                expect(fs.size()).toBe(0);

                var v = fs.set('a', true);

                expect(v).toEqual('{"bool":true}');
                expect(fs.size()).toBe(1);

                v = fs.get('a', 'default');
                expect(v).toBe(true);

            });

            it('should set an object item', function () {

                fs.clear();
                expect(fs.size()).toBe(0);

                var v = fs.set('a', {a:1, b:"s"});

                expect(v).toEqual('{"json":{"a":1,"b":"s"}}');
                expect(fs.size()).toBe(1);

                v = fs.get('a', 'default');
                expect(v.a).toBe(1);
                expect(v.b).toBe('s');

            });

            it('should set an XML item', function () {

                fs.clear();
                expect(fs.size()).toBe(0);

                var xml = a4p.Xml.string2Xml('<span><div><p/></div></span>');
                var v = fs.set('a', xml);

                expect(v).toEqual('{"xml":"<span><div><p/></div></span>"}');
                expect(fs.size()).toBe(1);

                v = fs.get('a', 'default');

                expect(v).not.toBeNull();
                expect(a4p.Xml.xml2String(v)).toEqual('<span><div><p/></div></span>');

            });

            it('should set null value', function () {

                fs.clear();
                expect(fs.size()).toBe(0);

                var v = fs.set('a', null);

                expect(v).toBe('null');
                expect(fs.size()).toBe(1);

                v = fs.get('a', 'default');

                expect(v).toBeNull();

            });

            it('should set undefined value', function () {

                fs.clear();
                expect(fs.size()).toBe(0);

                var u;
                var v = fs.set('a', u);

                expect(typeof(u)).toEqual('undefined');
                expect(v).toBe('null');
                expect(fs.size()).toBe(1);

                v = fs.get('a', 'default');

                expect(v).toBeNull();

            });

            it('should reject function value', function () {

                fs.clear();
                expect(fs.size()).toBe(0);

                var errorMsg;
                var v;
                try {
                    v = fs.set('a', function () {
                        return 1;
                    });
                } catch (e) {
                    errorMsg = e.message;
                }

                expect(errorMsg).toEqual('Value type function is invalid. It must be null, undefined, xml, string, number, boolean or object');

                v = fs.get('a', 'default');

                expect(v).toBe('default');
                expect(fs.size()).toBe(0);

            });

            it('should reject number key', function () {

                fs.clear();
                expect(fs.size()).toBe(0);

                var errorMsg;
                var v;

                try {
                    v = fs.set(2, 'v');
                } catch (e) {
                    errorMsg = e.message;
                }

                expect(errorMsg).toEqual('Key type must be string');
                expect(fs.size()).toBe(0);

                try {
                    errorMsg = null;
                    v = fs.get(2);
                } catch (e) {
                    errorMsg = e.message;
                }

                expect(errorMsg).toEqual('Key type must be string');

            });

            it('should reject boolean key', function () {

                fs.clear();
                expect(fs.size()).toBe(0);

                var errorMsg;
                var v;

                try {
                    v = fs.set(true, 'v');
                } catch (e) {
                    errorMsg = e.message;
                }

                expect(errorMsg).toEqual('Key type must be string');
                expect(fs.size()).toBe(0);

                try {
                    errorMsg = null;
                    v = fs.get(true);
                } catch (e) {
                    errorMsg = e.message;
                }

                expect(errorMsg).toEqual('Key type must be string');

            });

            it('should reject object key', function () {

                fs.clear();
                expect(fs.size()).toBe(0);

                var errorMsg;
                var v;

                try {
                    v = fs.set({a:"a", b:1}, 'v');
                } catch (e) {
                    errorMsg = e.message;
                }

                expect(errorMsg).toEqual('Key type must be string');
                expect(fs.size()).toBe(0);

                try {
                    errorMsg = null;
                    v = fs.get({a:"a", b:1});
                } catch (e) {
                    errorMsg = e.message;
                }

                expect(errorMsg).toEqual('Key type must be string');

            });

            it('should browse all items with instance method', function () {

                function Index() {
                    this.list = [];
                }

                Index.prototype.add = function (n) {
                    this.list.push(n);
                };
                Index.prototype.get = function (n) {
                    return this.list[n];
                };
                Index.prototype.size = function () {
                    return this.list.length;
                };

                fs.clear();
                expect(fs.size()).toBe(0);

                fs.set('k', '1');
                fs.set('d', '2');
                fs.set('u', '3');

                expect(fs.size()).toBe(3);
                expect(fs.get('k')).toBe('1');
                expect(fs.get('d')).toBe('2');
                expect(fs.get('u')).toBe('3');

                var index = new Index();

                expect(index.size()).toBe(0);

            });

            it('should browse all items with class method', function () {

                var Index = (function () {
                    var list = [];

                    function Index() {
                    }

                    Index.add = function (n) {
                        list.push(n);
                    };
                    Index.get = function (n) {
                        return list[n];
                    };
                    Index.size = function () {
                        return list.length;
                    };

                    return Index;
                })();

                fs.clear();
                expect(fs.size()).toBe(0);

                fs.set('k', '1');
                fs.set('d', '2');
                fs.set('u', '3');

                expect(fs.size()).toBe(3);
                expect(fs.get('k')).toBe('1');
                expect(fs.get('d')).toBe('2');
                expect(fs.get('u')).toBe('3');
                expect(Index.size()).toBe(0);

            });

            it('should browse all items with function', function () {

                var list = [];

                fs.clear();
                expect(fs.size()).toBe(0);

                fs.set('k', '1');
                fs.set('d', '2');
                fs.set('u', '3');

                expect(fs.size()).toBe(3);
                expect(fs.get('k')).toBe('1');
                expect(fs.get('d')).toBe('2');
                expect(fs.get('u')).toBe('3');
                expect(list.length).toBe(0);

                fs.foreach(function (n) {
                    list.push(n);
                });

                // alphabetical sorted ?
                expect(list.length).toBe(3);
                expect(list[0]).toBe('3');
                expect(list[1]).toBe('2');
                expect(list[2]).toBe('1');

            });

        });

        describe('with memory storage', function () {

            var LocalStorage = null;
            var fs = null;
            beforeEach(function () {
                LocalStorage = new a4p.LocalStorageFactory(new a4p.MemoryStorage());
                fs = new LocalStorage();
            });

            it('should be not null', function () {

                expect(fs).not.toBeNull();

            });

            it('should set a string item', function () {

                fs.clear();
                expect(fs.size()).toBe(0);

                var v = fs.set('a', 'v');

                expect(v).toEqual('{"string":"v"}');
                expect(fs.size()).toBe(1);

                v = fs.get('a', 'default');
                expect(v).toBe('v');

                v = fs.remove('a');
                expect(v).toBe(true);
                expect(fs.size()).toBe(0);

                v = fs.remove('a');
                expect(v).toBe(false);

            });

            it('should set a number item', function () {

                fs.clear();
                expect(fs.size()).toBe(0);

                var v = fs.set('a', 15);

                expect(v).toEqual('{"number":15}');
                expect(fs.size()).toBe(1);

                v = fs.get('a', 'default');
                expect(v).toBe(15);

                v = fs.clear();
                expect(v).toBe(true);
                expect(fs.size()).toBe(0);

                v = fs.clear();
                expect(v).toBe(false);

            });

            it('should set a boolean item', function () {

                fs.clear();
                expect(fs.size()).toBe(0);

                var v = fs.set('a', true);

                expect(v).toEqual('{"bool":true}');
                expect(fs.size()).toBe(1);

                v = fs.get('a', 'default');
                expect(v).toBe(true);

            });

            it('should set an object item', function () {

                fs.clear();
                expect(fs.size()).toBe(0);

                var v = fs.set('a', {a:1, b:"s"});

                expect(v).toEqual('{"json":{"a":1,"b":"s"}}');
                expect(fs.size()).toBe(1);

                v = fs.get('a', 'default');
                expect(v.a).toBe(1);
                expect(v.b).toBe('s');

            });

            it('should set an XML item', function () {

                fs.clear();
                expect(fs.size()).toBe(0);

                var xml = a4p.Xml.string2Xml('<span><div><p/></div></span>');
                var v = fs.set('a', xml);

                expect(v).toEqual('{"xml":"<span><div><p/></div></span>"}');
                expect(fs.size()).toBe(1);

                v = fs.get('a', 'default');

                expect(v).not.toBeNull();
                expect(a4p.Xml.xml2String(v)).toEqual('<span><div><p/></div></span>');

            });

            it('should set null value', function () {

                fs.clear();
                expect(fs.size()).toBe(0);

                var v = fs.set('a', null);

                expect(v).toBe('null');
                expect(fs.size()).toBe(1);

                v = fs.get('a', 'default');

                expect(v).toBeNull();

            });

            it('should set undefined value', function () {

                fs.clear();
                expect(fs.size()).toBe(0);

                var u;
                var v = fs.set('a', u);

                expect(typeof(u)).toEqual('undefined');
                expect(v).toBe('null');
                expect(fs.size()).toBe(1);

                v = fs.get('a', 'default');

                expect(v).toBeNull();

            });

            it('should reject function value', function () {

                fs.clear();
                expect(fs.size()).toBe(0);

                var errorMsg;
                var v;
                try {
                    v = fs.set('a', function () {
                        return 1;
                    });
                } catch (e) {
                    errorMsg = e.message;
                }

                expect(errorMsg).toEqual('Value type function is invalid. It must be null, undefined, xml, string, number, boolean or object');

                v = fs.get('a', 'default');

                expect(v).toBe('default');
                expect(fs.size()).toBe(0);

            });

            it('should reject number key', function () {

                fs.clear();
                expect(fs.size()).toBe(0);

                var errorMsg;
                var v;

                try {
                    v = fs.set(2, 'v');
                } catch (e) {
                    errorMsg = e.message;
                }

                expect(errorMsg).toEqual('Key type must be string');
                expect(fs.size()).toBe(0);

                try {
                    errorMsg = null;
                    v = fs.get(2);
                } catch (e) {
                    errorMsg = e.message;
                }

                expect(errorMsg).toEqual('Key type must be string');

            });

            it('should reject boolean key', function () {

                fs.clear();
                expect(fs.size()).toBe(0);

                var errorMsg;
                var v;

                try {
                    v = fs.set(true, 'v');
                } catch (e) {
                    errorMsg = e.message;
                }

                expect(errorMsg).toEqual('Key type must be string');
                expect(fs.size()).toBe(0);

                try {
                    errorMsg = null;
                    v = fs.get(true);
                } catch (e) {
                    errorMsg = e.message;
                }

                expect(errorMsg).toEqual('Key type must be string');

            });

            it('should reject object key', function () {

                fs.clear();
                expect(fs.size()).toBe(0);

                var errorMsg;
                var v;

                try {
                    v = fs.set({a:"a", b:1}, 'v');
                } catch (e) {
                    errorMsg = e.message;
                }

                expect(errorMsg).toEqual('Key type must be string');
                expect(fs.size()).toBe(0);

                try {
                    errorMsg = null;
                    v = fs.get({a:"a", b:1});
                } catch (e) {
                    errorMsg = e.message;
                }

                expect(errorMsg).toEqual('Key type must be string');

            });

            it('should browse all items with instance method', function () {

                function Index() {
                    this.list = [];
                }

                Index.prototype.add = function (n) {
                    this.list.push(n);
                };
                Index.prototype.get = function (n) {
                    return this.list[n];
                };
                Index.prototype.size = function () {
                    return this.list.length;
                };

                fs.clear();
                expect(fs.size()).toBe(0);

                fs.set('k', '1');
                fs.set('d', '2');
                fs.set('u', '3');

                expect(fs.size()).toBe(3);
                expect(fs.get('k')).toBe('1');
                expect(fs.get('d')).toBe('2');
                expect(fs.get('u')).toBe('3');

                var index = new Index();

                expect(index.size()).toBe(0);

                fs.foreach(Index.prototype.add, index);

                // Order in MemoryStorage is chronological while with window order is alphabetical
                expect(index.size()).toBe(3);
                expect(index.get(0)).toBe('1');
                expect(index.get(1)).toBe('2');
                expect(index.get(2)).toBe('3');

            });

            it('should browse all items with class method', function () {

                var Index = (function () {
                    var list = [];

                    function Index() {
                    }

                    Index.add = function (n) {
                        list.push(n);
                    };
                    Index.get = function (n) {
                        return list[n];
                    };
                    Index.size = function () {
                        return list.length;
                    };

                    return Index;
                })();

                fs.clear();
                expect(fs.size()).toBe(0);

                fs.set('k', '1');
                fs.set('d', '2');
                fs.set('u', '3');

                expect(fs.size()).toBe(3);
                expect(fs.get('k')).toBe('1');
                expect(fs.get('d')).toBe('2');
                expect(fs.get('u')).toBe('3');
                expect(Index.size()).toBe(0);

                fs.foreach(Index.add);

                // Order in MemoryStorage is chronological while with window order is alphabetical
                expect(Index.size()).toBe(3);
                expect(Index.get(0)).toBe('1');
                expect(Index.get(1)).toBe('2');
                expect(Index.get(2)).toBe('3');

            });

            it('should browse all items with function', function () {

                var list = [];

                fs.clear();
                expect(fs.size()).toBe(0);

                fs.set('k', '1');
                fs.set('d', '2');
                fs.set('u', '3');

                expect(fs.size()).toBe(3);
                expect(fs.get('k')).toBe('1');
                expect(fs.get('d')).toBe('2');
                expect(fs.get('u')).toBe('3');
                expect(list.length).toBe(0);

                fs.foreach(function (n) {
                    list.push(n);
                });

                // Order in MemoryStorage is chronological while with window order is alphabetical
                expect(list.length).toBe(3);
                expect(list[0]).toBe('1');
                expect(list[1]).toBe('2');
                expect(list[2]).toBe('3');

            });

        });

    });
});
