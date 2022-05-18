# photo-organizer
a NON FANCY electron app for EASILY organizing photos into folders!

## Why did I make this

Most of the existing software for this purpose is too complicated / advanced and not optimized for speed and ease-of-use.
Software doesn't need to be fancy, it needs to get the job done. 

## USAGE:

1. `npm install` to get deps. I am on Node 16 at time of writing. Hopefully it'll work with different versions.
2. `npm start` to start (TODO: package it up and make a doubleclick launcher)
3. Click "Pick src folder", choose the folder which contains your UNORGANIZED images
4. Click "Pick dest folder", choose the folder which will eventially contain your ORGANIZED images
   - Note: dest folder is expected to contain sub-folders, which is where you will move the images to
5. Can use the "add folder" to add a new subfolder in the destination folder or click any of the existing subfolders to move the image there.

## Note on metadata

This program doesn't do anything with EXIF metadata. If you want to do that, I personally recommend Picasa which isn't officially available but you can download from the internet still (google it). It is still the best image organizer program, but its tools for filesystem are lacking. So this repo complements it in that regard. 

![image](https://user-images.githubusercontent.com/105807061/169090155-a8e3f98d-9c66-489b-863b-c089982f309b.png)
