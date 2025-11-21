import { Component, OnInit } from '@angular/core';
import { PropertyService } from '../core/services/property.service';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { PostPropertiesService } from '../services/post-properties.service';
import { UiToastService } from '@app/services/ui-toast.service';
 
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {

  cities: string[] = ['Pune', 'Mumbai', 'Bangalore', 'Delhi', 'Chennai'];
  query: string = '';
  selectedTab: string = 'Rent';
  propertiesList: any = [];
  currentSelectedProperty: any;

  page = 0;
  size = 10;
  isLoading = false;
  hasMore = true;

  apartmentType = '';
  bhkType = '';
  localityCity = '';
  withinDays = '';
  propertyType = '';

  propertyAdsType = '';
  commercialPropertyType = '';
  buildingType = '';
  city = '';
  locality = '';
  minPrice = '';
  maxPrice = '';

  constructor(
    private propertyService: PropertyService,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private postPropertiesService: PostPropertiesService,
    private toast: UiToastService      // ✅ Inject toast service
  ) {}

  ngOnInit(): void {
    this.loadProperties();
  }

  // ----------------------------------------------------------------
  // 🔍 SEARCH
  // ----------------------------------------------------------------
  searchProperty(query: string) {
    if (!this.localityCity) {
      this.toast.warning("⚠️ Please select a city before searching.");
      return;
    }

    this.toast.info("🔎 Searching properties...");

    if (this.selectedTab === 'Buy') {
      this.router.navigate(
        [
          '/buy',
          {
            apartmentType: this.apartmentType,
            bhkType: this.bhkType,
            localityCity: this.localityCity,
            withinDays: this.withinDays,
          },
        ],
        { relativeTo: this.route }
      );
    } else if (this.selectedTab === 'Rent') {
      this.router.navigate(
        [
          '/Rent',
          {
            apartmentType: this.apartmentType,
            bhkType: this.bhkType,
            localityCity: this.localityCity,
            withinDays: this.withinDays,
          },
        ],
        { relativeTo: this.route }
      );
    } else if (this.selectedTab === 'Commercial') {
      this.router.navigate(['/commercial'], {
        queryParams: {
          propertyType: this.propertyType || 'Commercial',
          propertyAdsType: this.propertyAdsType || 'Sale',
          commercialPropertyType: this.commercialPropertyType || '',
          buildingType: this.buildingType || '',
          city: this.city || '',
          locality: this.locality || '',
          minPrice: this.minPrice ?? '',
          maxPrice: this.maxPrice ?? '',
          withinDays: this.withinDays ?? '',
        },
      });
    }
  }

  // ----------------------------------------------------------------
  // 🟦 TAB CHANGE
  // ----------------------------------------------------------------
  onTabClick(tab: string) {
    this.selectedTab = tab;
  }

  // ----------------------------------------------------------------
  // 🟩 SELECT PROPERTY
  // ----------------------------------------------------------------
  getSelectedProperty(selectedProperty: any) {
    this.currentSelectedProperty = selectedProperty;
  }
onPurposeChange(value: string) {
  this.propertyAdsType = value;
  console.log("Purpose selected:", value);
}

  // ----------------------------------------------------------------
  // ♻ INFINITE SCROLL LOAD PROPERTIES
  // ----------------------------------------------------------------
  loadProperties() {
    if (this.isLoading || !this.hasMore) return;

    this.isLoading = true;

    this.postPropertiesService.getRendedlistOfProperties(this.page, this.size).subscribe({
      next: (response: any) => {
        if (response?.content?.length) {
          this.propertiesList.push(...response.content);
          this.page++;
          this.hasMore = !response.last;
        } else {
          this.hasMore = false;
          this.toast.info("ℹ️ No more properties available.");
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.toast.error("❌ Failed to load properties. Please try again.");
        this.isLoading = false;
      },
    });
  }

  // ----------------------------------------------------------------
  // ➕ SCROLL EVENT
  // ----------------------------------------------------------------
  onScroll() {
    this.loadProperties();
  }

  // ----------------------------------------------------------------
  // 🕒 FORMAT TIME
  // ----------------------------------------------------------------
  formatTimeToDate(time: string): Date {
    if (!time) return new Date();

    const parts = time.split(':');
    if (parts.length < 2) return new Date();

    const [hours, minutes, seconds] = parts.map(Number);
    const date = new Date();
    date.setHours(hours, minutes, seconds || 0);

    return date;
  }
}
