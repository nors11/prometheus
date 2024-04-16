export class AppConstants {

    // App constants variables
    
    public static JWT_SECRET_KEY            = 'EQj6aqnj0OY40BnQ0zbWdryqjO6Ft5JTbnXYQjrl';
    public static FRONTEND_URL              = (process.env.FRONTEND_URL) ? process.env.FRONTEND_URL :'http://localhost/';
    public static DEFAULT_LANGUAGE          = 'es';
    public static ASSETS_TECNEPLAS_DIRECTORY  = 'home/backend/assets/uploads/tecneplas';
    public static BACKEND_URL = (process.env.BACKEND_URL) ? process.env.BACKEND_URL :'http://localhost:3000/';
    public static FONTSIZE = {
        1: 7,
        2: 14,
        3: 28,
        4: 56
    }
}