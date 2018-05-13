/**
 * 单元测试
 */

const express = require('express');
const request = require('supertest');

const dynamicMiddleware = require('../');

describe('initial', function() {
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
