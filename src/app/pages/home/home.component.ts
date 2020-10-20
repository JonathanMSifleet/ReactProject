import { Component, OnInit, OnDestroy } from '@angular/core';

import { Review } from './home-review.model';
import { ReviewsService } from './reviews.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  loadedReviews: Review;

  constructor(
    private reviewsService: ReviewsService,
  ) { }

  reviewSubscription = null;

  ngOnInit(): void {
      this.fetchReviews();
  }

  ngOnDestroy(): void {
    if (this.reviewSubscription !== null) {
      this.reviewSubscription.unsubscribe();
    }
  }

  private fetchReviews(): void {
    this.reviewSubscription = this.reviewsService.fetchReviews().subscribe((reviews) => {
      this.loadedReviews = reviews;
    });
  }
}
