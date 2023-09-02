const service= require('./reviews.service');

async function destroy(req,res){
  await service.delete(Number(res.locals.review.review_id));
  res.sendStatus(204);
}

async function validateId(req,res,next){
  const {reviewId}= req.params;
  const review= await service.read(Number(reviewId));
  if (review){
    res.locals.review= review;
    return next()
  }
  next({
    status:404,
    message:"Review cannot be found."
  })
}

async function update(req,res){
  const newReview= {
    ...req.body.data,
    review_id: res.locals.review.review_id,// to prevent the update of the review_id accidentally or intentionally.
  }
  // newReview sets the conditions. retrieve the new data and keeps the existing review_id
  await service.update(newReview)// waits until the newReview is completed.
  const review= await service.read(res.locals.review.review_id)// reuse read function to retrieve the new data.
  const reviewToReturn={
    ...review,// a new review const is created which will include the review(new) and will add the critic object from critics table depending of the given critic_id
    critic: await service.readCritic(res.locals.review.critic_id)
  }
  res.json({data:reviewToReturn}) // will return the updated review.
}

async function readReviews(req, res) {
	const reviews = await service.readReviews(res.locals.movie.movie_id);

	for(let review of reviews) {
		const critic = await service.readCritic(review.critic_id);

		review["critic"] = critic;
	}

	res.json({ data: reviews });
}
module.exports={
  delete:[validateId,destroy],
  update:[validateId,update],
  readReviews,
}