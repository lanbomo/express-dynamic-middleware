/**
 * 单元测试
 */

const express = require('express');
const request = require('supertest');
const sinon = require('sinon');

const assert = require('assert');

const dynamicMiddleware = require('../');

describe('initial', function() {
    this.timeout(6000);

    it('init function middleware', function(done) {
        const dynamic = dynamicMiddleware.create(function(req, res, next) {
            if (req.query.name === 'lanbomo') {
                res.end('hello!');
            } else {
                res.status(404).end('404 not found');
            }
        });

        const app = express()
            .use(dynamic.handle());

        request(app)
            .get('/')
            .expect(404, '404 not found')
            .end(function(err) {
                if (err) return done(err);

                request(app)
                    .get('/index?name=lanbomo')
                    .expect(200, 'hello!', done);
            });
    });

    it('init array middlewares', function(done) {
        const auth = function(req, res, next) {
            if (req.get('Authorization') === 'Basic') {
                next();
            } else {
                res.status(401).end('Unauthorization');
            }
        };

        const router = express.Router();
        router.get('/hello', function(req, res) {
            res.end('world');
        });

        router.post('/submit', function(req, res) {
            res.json({
                succeed: req.get('Content-Type') === 'application/json'
            });
        });

        const dynamic = dynamicMiddleware.create([auth, router]);

        const app = express()
            .use(dynamic.handle());

        request(app)
            .get('/')
            .expect(401, 'Unauthorization', function(err) {
                if (err) return done(err);

                request(app)
                    .get('/hello')
                    .set('Authorization', 'Basic')
                    .expect(200, 'world', function(err) {
                        if (err) return done(err);

                        request(app)
                            .post('/submit')
                            .set('Authorization', 'Basic')
                            .set('Content-Type', 'application/json')
                            .expect(200, {succeed: true}, done);
                    });
            });
    });
});

describe('use and unuse', function() {
    describe('use new middleware', function(done) {
        this.timeout(6000);

        const dynamic = dynamicMiddleware.create(function(req, res, next) {
            if (req.method === 'GET') {
                res.send('get');
            }

            next();
        });

        const app = express()
            .use('/', dynamic.handle());

        it('first middleware', function(done) {
            request(app)
                .get('/')
                .expect(200, 'get', done);
        });

        it('second middleware', function(done) {
            setTimeout(function() {
                dynamic.use(function(req, res, next) {
                    if (req.method === 'POST') {
                        res.send('post');
                    }

                    next();
                });

                request(app)
                    .post('/')
                    .expect(200, 'post', done);
            }, 1000);
        });

        it('third middleware', function(done) {
            setTimeout(function() {
                dynamic.use(function(req, res, next) {
                    if (req.method === 'PUT') {
                        res.send('put');
                    }
                });

                request(app)
                    .put('/')
                    .expect(200, 'put', done);
            }, 2000);
        });
    });

    describe('unuse middleware', function() {
        it('unuse', function(done) {
            const middlewareAuth = function(req, res, next) {
                if (req.query.name === 'lanbomo') {
                    res.end('hello');
                }
            };

            const dynamic = dynamicMiddleware.create(middlewareAuth);

            const app = express()
                .use('/', dynamic.handle());

            request(app)
                .get('/index?name=lanbomo')
                .expect(200, 'hello')
                .end(function(err) {
                    if (err) return done(err);

                    dynamic.unuse(middlewareAuth);

                    request(app)
                        .get('/index?name=lanbomo')
                        .expect(404, done);
                });
        });
    });
});

describe('get and clean', function() {
    it('get middleware', function(done) {
        const dynamic = dynamicMiddleware.create([
            function() {},
            function() {}
        ]);

        const middlewareLength = dynamic.get().length;

        assert(middlewareLength === 2);
        done();
    });

    it('clean middleware', function(done) {
        const dynamic = dynamicMiddleware.create([
            function() {},
            function() {}
        ]);

        assert(dynamic.get().length === 2);

        dynamic.clean();

        assert(dynamic.get().length === 0);

        done();
    });
});

describe('exceptions', function() {
    it('init array include value of not function', function(done) {
        sinon.spy(console, 'warn');

        dynamicMiddleware.create([function() {}, null]);

        assert(console.warn.getCall(0).args[0] === 'inintial middlewares array should be include functions');

        console.warn.restore();
        done();
    });

    it('init not function or array', function(done) {
        sinon.spy(console, 'warn');

        dynamicMiddleware.create(null);

        assert(console.warn.getCall(0).args[0] === 'inintial argument should be a function or an array');

        console.warn.restore();
        done();
    });

    it('init without argument', function(done) {
        const dynamic = dynamicMiddleware.create();

        assert(dynamic.get().length === 0);

        done();
    });

    it('use not function', function(done) {
        sinon.spy(console, 'warn');

        const dynamic = dynamicMiddleware.create();

        dynamic.use(null);

        assert(console.warn.getCall(0).args[0] === 'use middleware should be a function');

        console.warn.restore();
        done();
    });

    it('handle error', function(done) {
        this.timeout(6000);

        sinon.spy(console, 'error');

        const dynamic = dynamicMiddleware.create(function(req, res, next) {
            res.end();
            next('error');
        });

        const app = express()
            .use('/', dynamic.handle());

        request(app)
            .get('/')
            .end(function() {
                assert(console.error.getCall(0).args[0] === 'error');

                console.error.restore();
                done();
            });
    });
});
