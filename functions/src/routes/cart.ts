import express from 'express';
import Cart from '../models/Cart';
import { getClient } from '../db';
import { ObjectId } from 'mongodb';
import { database } from 'firebase-admin';

const cartRoutes = express.Router();

cartRoutes.get('/cart-items', async (req, res) => { //slide 80 of 9b
    const client = await getClient();
    let product: string = req.query.product as string;
    let pageSize: number = parseInt(req.query.pageSize as string);
    let maxPrice: number = parseInt(req.query.maxPrice as string) ;
    if(maxPrice){
        const results = await client.db().collection<Cart>('cartItems')
            .find({price: { $lte: maxPrice} }).toArray();
            res.status(200);
        res.json(results);
    } else if(product){
        const results = await client.db().collection<Cart>('cartItems')
            .find({product: product}).toArray();
            res.status(200);
        res.json(results);
    } else if(pageSize){
        const results = await client.db().collection<Cart>('cartItems')
        .find().limit(pageSize).toArray();
        res.status(200);
    res.json(results);
    }

    // max price    ?maxPrice=
     
});

cartRoutes.get('/cart-items/:id', async (req, res) => {
    let id: string = req.params.id;
    try {
    const client = await getClient();
    const results = await client.db().collection<Cart>('cartItems').findOne({_id: new ObjectId(id)})
    
    if(results) {
        res.status(200);
        res.json(results);
    } else {
        res.status(404).json({message: "Not Found"});
    }
} catch(e){
    console.error("Error:", e);
}
});

cartRoutes.post('/cart-items', async (req, res) => {
    const cartItem = req.body as Cart;

    const client = await getClient();
    await client.db().collection<Cart>('cartItems').insertOne(cartItem);
    res.status(201).json(cartItem);
});

cartRoutes.put('/cart-items/:id', async (req, res) => {
    const id = req.params.id;
    const cart = req.body as Cart;
    delete cart._id; // remove _id from body so we only have one.
    try {
        const client = await getClient();
        const results = await client.db().collection<Cart>('cartItems').replaceOne({_id: new ObjectId(id)}, cart);
        if(results.modifiedCount === 0){
            res.status(404).json({message: "Not Found"});
        } else {
            cart._id = new ObjectId(id);
            res.status(200);
            res.json(cart);
        }
    } catch (e) {
        console.error("Error: ", e);
    }
});

cartRoutes.delete('/cart-items/:id', async (req, res) => {
    let inputId: string = req.params.id;
    try {
    const client = await getClient();
    const result = await client.db().collection<Cart>('cartItems')
        .deleteOne({_id: new ObjectId(inputId)});
    if(result.deletedCount === 0) {
        res.status(404).json({message: 'Not Found'});
    } else {
        res.status(204).end();
    }
    }
    catch (err) {
        console.error("Error:", err);
    }
})


export default cartRoutes;