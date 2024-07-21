import express from "express";
import bodyParser from "body-parser";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const app = express();
const port = 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const blogsFilePath = path.join(__dirname, 'blogs.json');

// Function to read blogs from JSON file
const readBlogs = () => {
  if (fs.existsSync(blogsFilePath)) {
    const data = fs.readFileSync(blogsFilePath);
    return JSON.parse(data);
  }
  return [];
};

// Function to write blogs to JSON file
const writeBlogs = (blogs) => {
  fs.writeFileSync(blogsFilePath, JSON.stringify(blogs, null, 2));
};

app.get('/existing', (req, res) => {
  const blogs = readBlogs();
  res.render('existing', { blogs });
});

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.get("/about", (req, res) => {
  res.render("about.ejs");
});

app.get("/blogs", (req, res) => {
  const blogs = readBlogs();
  res.render("existing", { blogs });
});

app.get("/contact", (req, res) => {
  res.render("contact.ejs");
});

app.post("/submit", (req, res) => {
  const action = req.body.action;
  if (action === 'Create Blog') {
    res.render("create.ejs");
  } else if (action === 'Way to Blogs') {
    const blogs = readBlogs();
    res.render("existing", { blogs });
  }
});

app.post('/create', (req, res) => {
  const title = req.body.input1;
  const content = req.body.textarea;

  const newFileName = path.join(__dirname, 'views', `${title.replace(/\s+/g, '_')}.ejs`);
  const newFileContent = `<h1>${title}</h1><p>${content}</p>`;

  fs.writeFile(newFileName, newFileContent, (err) => {
    if (err) {
      return res.render('index', { message: 'Error creating file' });
    }

    // Update the blogs JSON file with the new blog link
    const blogs = readBlogs();
    blogs.push({ title, link: `/${title.replace(/\s+/g, '_')}` });
    writeBlogs(blogs);

    // Redirect to the existing blogs page with updated list
    res.redirect('/blogs');
  });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
