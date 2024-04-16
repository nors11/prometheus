import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})

export class CrossSizesConstants {

    public BLOCK_SIZE = 790;
    public FRAME_SIZE = 784;
    public PAUSE_MS = 5;

    public topPanel_X = 14;
    public topPanel_Y = 14;

    public middlePanel_X = 42;
    public middlePanel_Y = 14;

    public bottomPanel_X = 14;
    public bottomPanel_Y = 14;

    public topEdge = 7;
    public bottomEdge = 7;
    public leftEdge = 7;
    public rightEdge = 7;

}