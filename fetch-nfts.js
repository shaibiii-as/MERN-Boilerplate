exports.fundraiseNFTs = async (req, res, next) => {
 try {
   const { userId, payload } = req.user;


   if (!userId)
     return res
       .status(400)
       .send({ success: false, message: "User is required" });


   if (!payload.quantity)
     return res
       .status(400)
       .send({ success: false, message: "Please provide quantity" });
   else {
     payload.quantity = Number(payload.quantity);
     if (payload.quantity < 1 || payload.quantity > 10)
       return res
         .status(400)
         .send({
           success: false,
           message: "Please provide quantity in range 1-10 only",
         });
   }


   //Check if the Fundriser NFT has been created by the admin
   const nftRes = await getFundraiserNFT();
   if (!nftRes)
     return res
       .status(400)
       .send({
         success: false,
         message: "Sorry, we're unable to mint NFTs for you",
       });


   // upsert fundraising owners
   const { nftId, creatorId, collectionId } = nftRes;
   const ownerData = {
     ownerId: userId,
     nftId,
     creatorId,
     collectionId,
   };


   await Owners.findOneAndUpdate(
     { ownerId: userId, nftId },
     { $set: ownerData, $inc: { copies: payload.quantity } },
     { upsert: true }
   );


   // update sold count in db
   let stats = null;
   const nft = await NFT.findOneAndUpdate(
     { forFundraising: true },
     { $inc: { sold: payload.quantity } },
     { new: true }
   );
   if (nft) {
     stats = {
       _id: nft._id,
       copies: nft.copies,
       sold: nft.sold,
     };


     // create activity for nft sale
     insert({
       userId: creatorId,
       toUserId: userId,
       nftId,
       type: 7,
       price: payload.price,
       currency: payload.currency,
       collectionId,
       quantity: payload.quantity,
     });
   }


   return res.json({
     success: true,
     message: `We've minted ${payload.quantity} number of copies of NFT(s) for you successfully`,
     stats,
   });
 } catch (error) {
   next(error);
 }
};
