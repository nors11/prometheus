import { environment } from '../environments/environment';

export class AppConfig {
    public static backendUrl = (environment.backendUrl) ? environment.backendUrl : 'http://localhost:3000/v1/';
    public static backendUrlPath = (environment.backendUrlPath) ? environment.backendUrlPath : 'http://localhost:3000';
    public static FONTSIZE = {
        1: 7,
        2: 14,
        3: 28,
        4: 56
    }
}