const movieModel = require("../models/movies");
const redisClient = require("../../../config/redis-con");
module.exports = {
  getById: async function (req, res, next) {
    let isCached = false;

    try {
      const cacheResults = await redisClient.get(req.params.movieId);
      let result;
      if (cacheResults) {
        isCached = true;
        result = JSON.parse(cacheResults);
      } else {
        result = await movieModel.findById(req.params.movieId);
        if (!result)
          return res.json({ message: "No Movie Found with the Given Id!!!" });

        await redisClient.set(req.params.movieId, JSON.stringify(result));
      }

      return res.json({
        fromCache: isCached,
        status: "success",
        message: "Movie found!!!",
        data: { movie: result },
      });
    } catch (error) {
      next(error);
    }
  },

  getAll: async function (req, res, next) {
    const { page_number } = req.body;

    const no_of_docs_each_page = 3; // 3 movies in single page
    const current_page_number = page_number;
    let isCached = false;

    try {
      const cacheResults = await redisClient.get("GetAll" + page_number);
      let result;

      if (cacheResults) {
        isCached = true;
        result = JSON.parse(cacheResults);
      } else {
        const totalPages = Math.ceil((await movieModel.count()) / no_of_docs_each_page);

        if (current_page_number > totalPages || current_page_number < 1)
          return res.json({
            message:
              "Invalid page Number!!! . Please Enter page number value between 1 and " +
              totalPages,
          });

        result = await movieModel
          .find({})
          .sort({ released_on: -1 })
          .skip(no_of_docs_each_page * (current_page_number - 1))
          .limit(no_of_docs_each_page);

        if (!result) return res.json({ message: "No Movies Found !!!" });

        await redisClient.set("GetAll" + page_number, JSON.stringify(result));
      }

      //console.log((moviesList))

      return res.status(200).json({
        fromCache: isCached,
        status: "success",
        message: "Movies list found!!!",
        data: { movies: result },
      });
    } catch (error) {
      next(error);
    }
  },

  updateById: async function (req, res, next) {
    try {
      const result = await movieModel.findByIdAndUpdate(req.params.movieId, {
        name: req.body.name,
        director: req.body.director,
        language: req.body.language,
        duration: req.body.duration,
        released_on: req.body.released_on,
        description: req.body.description,
        added_by: req.body.userId,
      });

      if (!result) return res.json({ message: "No Movie Found with the Given Id!!!" });

      if (result.added_by != req.body.userId)
        return res.json({
          message: "Sorry. User does not have right to edit this movie",
        });


        await redisClient.del(req.params.movieId);
        const keys = await redisClient.KEYS("GetAll*");

        if(keys.length>0) await redisClient.del(keys);

      return res.json({
        status: "success",
        message: "Movie updated successfully!!!",
        data: null,
      });

      


    } catch (error) {
      next(error);
    }
  },
  deleteById: async function (req, res, next) {
    try {
      const result = await movieModel.findById(req.params.movieId);

      if (!result)
        return res.json({ message: "No Movie found with the given Id!!!" });

      if (result.added_by != req.body.userId)
        return res.json({
          message: "Sorry. User does not have right to delete this movie",
        });

      
      await movieModel.findByIdAndRemove(req.params.movieId);
      

      await redisClient.del(req.params.movieId);
      const keys = await redisClient.KEYS("GetAll*");
      
      if(keys.length>0) await redisClient.del(keys)
      
      
      return res.json({
        status: "success",
        message: "Movie deleted successfully!!!",
        data: null,
      });


      


    } catch (error) {
      next(error);
    }
  },
  
  
create: async function (req, res, next) {
    try {
      const result = await movieModel.create({
        name: req.body.name,
        director: req.body.director,
        language: req.body.language,
        duration: req.body.duration,
        released_on: req.body.released_on,
        description: req.body.description,
        added_by: req.body.userId,
      });

      //console.log(result)

      
      const keys = await redisClient.KEYS("GetAll*");

      if(keys.length>0) await redisClient.del(keys)

      return res.json({
        status: "success",
        message: "Movie added successfully!!!",
        data: result,
      });

      


    } catch (error) {
      next(error);
    }
  },
};
