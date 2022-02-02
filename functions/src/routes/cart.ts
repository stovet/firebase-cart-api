import express from 'express';
import Cart from '../models/Cart';
import { getClient } from '../db';
import { ObjectId } from 'mongodb';
import { database } from 'firebase-admin';

const cartRoutes = express.Router();

cartRoutes.get('/cart-items', async (req, res) => {
    const client = await getClient();
    const results = await client.db().collection<Cart>('cartItems').find().toArray();
    let maxPriceParam: string = req.query.maxPrice as string;
    let productParam: string = req.query.product as string;
    let pageSizeParam: string = req.query.pageSize as string;

    // max price    ?maxPrice=
     if(maxPriceParam){
        let maxPrice: number = parseFloat(maxPriceParam);
        let filteredCart: Cart[] = results.filter(result => {
            if(result.price <= maxPrice){
                return result;
            };
        });
        res.json(filteredCart);
    }
        if(pageSizeParam){
            let sizedCart: Cart[] = [];
            let pageSize: number = parseFloat(pageSizeParam);
            
            for(let i = 0; i < pageSize; i++){
                sizedCart[i] = results[i];
            }
            res.json(sizedCart);
        }
        if(productParam){
            let product: string = productParam;
            let filteredCart: Cart[] = results.filter(result => {
                if(result.product === product){
                    return result;
                };
            });
            res.status(200);
            res.json(filteredCart);
        }
    res.json(results);
});

cartRoutes.get('/cart-items/:id', async (req, res) => {
    let inputId: string = req.params.id;
    const client = await getClient();
    const results = await client.db().collection<Cart>('cartItems').find().toArray();
    try {
    for(let i = 0; i < results.length; i++){
        if(String(results[i]._id) === inputId){
            res.status(200);
            res.json(results[i]);
            break;
        }
    }
    res.status(200);
    res.json(results);
} catch(e){
    res.status(404).json({message: "Not Found"});
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