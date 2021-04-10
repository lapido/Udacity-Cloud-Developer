import express from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles, isValidUrl} from './util/util';
import fs from 'fs';
import path from 'path';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // IT SHOULD
  //    1
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

  app.get( "/filteredimage", async ( req, res ) => {

    const imageUrl = req.query.image_url;
    if (!imageUrl) {
      return res.status(400).send({ message: 'Image Url is required' });
    }

    //checks if imageUrl is a valid url
    const isValidurl = await isValidUrl(imageUrl);
    if (!isValidurl) {
      return res.status(400).send({ message: 'Image Url is incorrect' });
    }
    
    const outputPath = await filterImageFromURL(imageUrl);
    
    return res.sendFile(outputPath, function(err){
      if (!err) {
        const tempDirectory = path.join(__dirname, '/util/tmp');

        fs.readdir(tempDirectory, function(err, files) {

          if (err) {
            return console.log('Unable to scan directory: ' + err);
          }
          const filePathArray: string[] = [];

          files.forEach(function (file) {
            const filePath = tempDirectory + '/' + file;
            filePathArray.push(filePath);
          });

          return deleteLocalFiles(filePathArray)
            .then(x => {
              console.log('Action completed => Local files deleted')
            })
        }) 
      }
    })

  } );
  

  //! END @TODO1
  
  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();