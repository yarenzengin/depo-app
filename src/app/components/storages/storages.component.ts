import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-storages',
  templateUrl: './storages.component.html',
  styleUrls: ['./storages.component.css']
})
export class StoragesComponent implements OnInit {
  aisleForm: FormGroup;
  productForm: FormGroup;

  aisle: boolean = false;
  product: boolean = false;
  productDetail: boolean = false;

  categories = [
    { code: 1, name: 'Gıda' },
    { code: 2, name: 'Temizlik' },
    { code: 3, name: 'Kırtasiye' },
    { code: 4, name: 'Kozmetik' }
  ];
  
  selectedCategory: string = '';
  selectedWarehouse: string = ''; 
  nextAisleCode: string = '';
  selectedAisle: string = '';
  selectedProduct: any | null = null;

  storages: any[] = [];
  searchQuery: string = '';

  constructor(private fb: FormBuilder, private cdr: ChangeDetectorRef) {

    this.aisleForm = this.fb.group({
      aisleName: new FormControl({ value: '', disabled: true }),
      selectedCategory: new FormControl(''),
      warehouse: new FormControl({ value: '', disabled: true }) 
    });

    this.productForm = this.fb.group({
      productId: new FormControl(''),
      productName: new FormControl(''),
      aisle: new FormControl({ value: '', disabled: true }) 
    });
  }



  ngOnInit(): void {
    this.loadStorageData();
  }
  
  loadStorageData() {
    const savedStorages = localStorage.getItem('storages');

    if (savedStorages) {
      this.storages = JSON.parse(savedStorages);
    } 
    else {
      this.storages = [
        {
          name: "Depo A",
          aisles: [
            { code: 'R1', category: { name: 'Gıda' }, products: [] },
            { code: 'R2', category: { name: 'Temizlik' }, products: [] }
          ],
          aisleCodeCounter: 3
        },
        {
          name: "Depo B",
          aisles: [
            { code: 'R1', category: { name: 'Gıda' }, products: [] },
            { code: 'R2', category: { name: 'Temizlik' }, products: [] }
          ],
          aisleCodeCounter: 3
        }
      ];
    }
  }

  saveStorageData() {
    localStorage.setItem('storages', JSON.stringify(this.storages));
  }

  openAisleDialog(depoName: string) {
    this.selectedWarehouse = depoName;
    this.aisleForm.get('warehouse')?.setValue(this.selectedWarehouse); 
    
    const storage = this.storages.find(s => s.name === depoName);
    const aisleCount = storage?.aisles.length || 0; 
    this.nextAisleCode = `R${aisleCount + 1}`;
    this.aisleForm.get('aisleName')?.setValue(this.nextAisleCode); 

    this.aisle = true; 
  }

  openProductDialog(aisleCode: string, warehouseName: string) {
    this.selectedAisle = aisleCode;  
    this.selectedWarehouse = warehouseName;  
  
    this.productForm.reset();
    this.product = true; 
  }

  openProductDetailDialog(productId: string) {
    const storage = this.storages.find(s => s.name === this.selectedWarehouse);
    const aisle = storage?.aisles.find((a: { code: string; }) => a.code === this.selectedAisle);
    const product = aisle?.products.find((p: { id: string; }) => p.id === productId);
    
    if (product) {
      this.selectedProduct = product;  
      this.productForm.setValue({
        productId: product.id,
        productName: product.name,
        aisle: this.selectedAisle
      });
      this.productDetail = true;
    }
  }

  addAisle() {
    if (this.aisleForm.valid) {
      const storage = this.storages.find(s => s.name === this.selectedWarehouse);

      if (storage) {
        const newAisle = {
          code: `R${storage.aisleCodeCounter}`,  
          category: this.aisleForm.value.selectedCategory,
          products: []
        };
        
        storage.aisleCodeCounter++; 
        storage.aisles = [...storage.aisles, newAisle];
        this.storages = [...this.storages]; 
        this.saveStorageData();

        this.aisleForm.reset();
        this.aisle = false;
      }
    } 
  }

  addProduct() {
    if (this.productForm.valid) {
      const storage = this.storages.find(s => s.name === this.selectedWarehouse);
      const aisle = storage?.aisles.find((a: { code: string; }) => a.code === this.selectedAisle);

      if (storage && aisle) {
        const newProduct = {
          name: this.productForm.value.productName,
          id: this.productForm.value.productId
        };

        (aisle.products as any[]).push(newProduct);
        this.storages = [...this.storages]; 
        this.saveStorageData();

        this.productForm.reset();
        this.product = false;
      }
    } 
  }

  updateProduct() {
    const updatedProductName = this.productForm.get('productName')?.value;
  
    if (!updatedProductName) {
      console.error('Ürün adı boş olamaz');
      return;
    }
      if (this.selectedProduct) {
      this.selectedProduct.name = updatedProductName;
  
      this.saveStorageData();
  
      this.productDetail = false;
      console.log('Ürün güncellendi: ', updatedProductName);
    } else {
      console.error('Ürün bulunamadı');
    }
  }

  deleteProduct(productId: string) {
    const storage = this.storages.find(s => s.name === this.selectedWarehouse);
    const aisle = storage?.aisles.find((a: { code: string; }) => a.code === this.selectedAisle);
  
    if (aisle) {
      aisle.products = aisle.products.filter((product: { id: string }) => product.id !== productId);
        this.saveStorageData();
      this.storages = [...this.storages];
      this.cdr.detectChanges();
      this.productDetail = false; 
    }
  }

}
