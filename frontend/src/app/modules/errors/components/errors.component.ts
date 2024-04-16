import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CrossService } from '../../products/services/cross.service';
import { Category } from '../models/error';
import jsPDF from 'jspdf';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import htmlToPdfmake from 'html-to-pdfmake';

@Component({
    selector: 'tecneplas-errors',
    templateUrl: '../views/errors.component.html',
})
export class ErrorsComponent implements OnInit {

    public crosses;
    public category = Category;
    public loadding:boolean;

    @ViewChild('downloadSpinner') spinner: ElementRef;
    @ViewChild('downloadPDF') downloadPDF: ElementRef;
    @ViewChild('pdfContent') pdfContent: ElementRef;

    constructor(
        private crossService: CrossService
    ) { }

    ngOnInit(): void {
        this.loadding = true;
        this.crossService.indexWithErrors().subscribe((crosses) => {
            this.crosses = crosses;
            this.loadding = false;
        });
    }

    downloadErrors() {
        this.spinner.nativeElement.classList.remove("tecneplas-spinner");
        this.downloadPDF.nativeElement.disabled = true;

        if (this.downloadPDF.nativeElement.disabled) {
            var self = this;
            setTimeout(function () {
                self.downloadPdf().then(res => {
                    self.spinner.nativeElement.classList.add("tecneplas-spinner");
                    self.downloadPDF.nativeElement.disabled = false;
                });
            }, 10);
        }
    }

    async downloadPdf() {
        const doc = new jsPDF();
        const pdfContent = this.pdfContent.nativeElement;
        var html = htmlToPdfmake(pdfContent.innerHTML);
        const documentDefinition = { content: html };

        var currentDate = new Date();
        var filename = `${currentDate.getFullYear()}${currentDate.getMonth() + 1}${currentDate.getDate()}_error_report.pdf`;

        pdfMake.createPdf(documentDefinition).download(filename);
    }
}
