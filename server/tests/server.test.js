const expect = require('expect');
const request = require('supertest');

const { app } = require('./../server');
const { executeQuery } = require('./../db/mssql');
const { transactionQuery } = require('./../db/mssql');

beforeEach((done) => {
    transactionQuery('truncate table dbo.todos;', (err, result) => {
        done();
    });
});

describe('POST /todos', () => {
    it('should create a new todo', (done) => {
        var text = 'Test todo text';

        request(app)
            .post('/todos')
            .send({ text })
            .expect(200)
            .expect((res) => {
                expect(res.body.rowsAffected[0]).toBe(1);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                executeQuery('SELECT text FROM dbo.todos;', (err, result) => {
                    if (err) {
                        return done(err);
                    }
                    expect(result.rowsAffected[0]).toBe(1);
                    expect(result.recordset[0].text).toBe(text);
                    done();
                });
            });
    });

    it('should not create todo with invalid body data', (done) => {
        request(app)
            .post('/todos')
            .send({ text: '' })
            .expect(400)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                executeQuery('SELECT text FROM dbo.todos;', (err, result) => {
                    if (err) {
                        return done(err);
                    }
                    expect(result.rowsAffected[0]).toBe(0);
                    done();
                });
            });
    });

});