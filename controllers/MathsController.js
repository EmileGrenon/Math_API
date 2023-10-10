import Controller from './Controller.js';
import * as utilities from "./../utilities.js";
import path from 'path';
import fs from 'fs';
import mimes from './../mimes.js';

let defaultResource = 'index.html';

export default class BookmarksController extends Controller {
    constructor(HttpContext) {
        super(HttpContext);
    }
    get() {
        let queryString = utilities.decomposePath(this.HttpContext.req.url).params;
        if (this.HttpContext.req.url == "/api/Maths?") {
            return this.handleStaticResourceRequest("/maths");
        }
        if (queryString.op == null) {
            queryString.error = "le paramètre op est obligatoire";
            return this.HttpContext.response.JSON(queryString);
        }

        switch (queryString.op)
        {
            case " ":
                if (this.IsQueryStringValid(queryString)) {
                    queryString.value = parseInt(queryString.x) + parseInt(queryString.y);
                    return this.HttpContext.response.JSON(queryString);
                }
            case "-":
                if (this.IsQueryStringValid(queryString)) {
                    queryString.value = parseInt(queryString.x) - parseInt(queryString.y);
                    return this.HttpContext.response.JSON(queryString);
                }
            case "*":
                if (this.IsQueryStringValid(queryString)) {
                    queryString.value = parseInt(queryString.x) * parseInt(queryString.y);
                    return this.HttpContext.response.JSON(queryString);
                }
            case "/":
                if (this.IsQueryStringValid(queryString)) {
                    queryString.value = parseInt(queryString.x) / parseInt(queryString.y);
                    return this.HttpContext.response.JSON(queryString);
                }
            case "%":
                if (this.IsQueryStringValid(queryString)) {
                    queryString.value = parseInt(queryString.x) % parseInt(queryString.y);
                    return this.HttpContext.response.JSON(queryString);
                }
            case "!":
                if (this.IsQueryStringValid2(queryString)) {
                    queryString.value = this.Factoriel(queryString.n);
                    return this.HttpContext.response.JSON(queryString);
                }
            case "p":
                if (this.IsQueryStringValid2(queryString)) {
                    queryString.value = this.IsPrime(queryString.n);
                    return this.HttpContext.response.JSON(queryString);
                }
            case "np":
                if (this.IsQueryStringValid2(queryString)) {
                    queryString.value = this.nPrime(queryString.n);
                    return this.HttpContext.response.JSON(queryString);
                }

        }
        queryString.error = "la valeur du paramètre op n'est pas reconnu"
        this.HttpContext.response.JSON(queryString);
    }

    IsQueryStringValid(queryString) {
        if (Object.keys(queryString).length !== 3) {
            queryString.error = "doit avoir 3 paramètres";
            this.HttpContext.response.JSON(queryString);
            return false;
        }
        if (queryString.x == null || queryString.x == "") {
            queryString.error = "le paramètre x est obligatoire";
            this.HttpContext.response.JSON(queryString);
            return false;
        }
        if (queryString.y == null || queryString.y == "") {
            queryString.error = "le paramètre y est obligatoire";
            this.HttpContext.response.JSON(queryString);
            return false;
        }
        if (isNaN(queryString.x)) {
            queryString.error = "x doit être un nombre";
            this.HttpContext.response.JSON(queryString);
            return false;
        }
        if (isNaN(queryString.y)) {
            queryString.error = "y doit être un nombre";
            this.HttpContext.response.JSON(queryString);
            return false;
        }
        return true;
    }
    IsQueryStringValid2(queryString) {
        if (Object.keys(queryString).length !== 2) {
            queryString.error = "doit avoir 2 paramètres";
            this.HttpContext.response.JSON(queryString);
            return false;
        }
        if (queryString.n == null || queryString.n == "") {
            queryString.error = "le paramètre n est obligatoire";
            this.HttpContext.response.JSON(queryString);
            return false;
        }
        if (isNaN(queryString.n)) {
            queryString.error = "n doit être un nombre";
            this.HttpContext.response.JSON(queryString);
            return false;
        }
        return true;
    }

    Factoriel(n) {
        if (n === 0) {
          return 1;
        } else {
          return n * this.factoriel(n - 1);
        }
    }
    IsPrime(number) {
        if (number <= 1) {
          return false;
        }
        if (number <= 3) {
          return true;
        }
        
        if (number % 2 === 0 || number % 3 === 0) {
          return false;
        }
        
        for (let i = 5; i * i <= number; i += 6) {
          if (number % i === 0 || number % (i + 2) === 0) {
            return false;
          }
        }
        
        return true;
    }
    nPrime(n) {
        if (n == 1) {
            return 2; 
        }
  
        let i = 1;
        let number = 3;

        while (i < n) {
            if (this.IsPrime(number)) {
                i++;
                if (i == n) {
                    return number;
                }
            }
            number += 2;
        }
    }
    isDirectory(url) {
        let extension = path.extname(url).replace('.', '');
        return extension == '';
    }
    requestedStaticResource(url) {
        let isDir = this.isDirectory(url);
        url += isDir ? (url.slice(-1) != '/'? '/' : '' ) : '';
        let resourceName = isDir ? url + defaultResource : url;
        let resourcePath = path.join(process.cwd(), global.wwwroot, resourceName);
        return resourcePath;
    }
    extToContentType(filePath) {
        let extension = path.extname(filePath).replace('.', '');
        let contentType = mimes(extension);
        if (contentType !== undefined)
            return contentType;
        return 'text/html';
    }
    handleStaticResourceRequest(path) {
        let filePath = this.requestedStaticResource(path);
        let contentType = this.extToContentType(filePath);
        try {
            let content = fs.readFileSync(filePath);
            console.log(contentType, filePath);
            return this.HttpContext.response.content(contentType, content);
        } catch (error) {
            if (error.code === 'ENOENT')
                return false;
            else
                return this.HttpContext.response.internalError(`Server error: ${error.code}`);
        }
    }
}