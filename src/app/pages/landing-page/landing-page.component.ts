import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { fromEvent, Subscription, timer } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { MaterialModule } from 'app/components/material/material.module';
import '@lottiefiles/lottie-player';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { iconRegistry } from './icon-registry';
import { InventoryGridComponent } from './grid/grid';
import { Router } from '@angular/router';
interface Statistic {
	icon: any;
	value: string;
	label: string;
}

interface Image {
	url: string;
	alt: string;
}

@Component({
	selector: 'app-landing-page',
	standalone: true,
	imports: [
		CommonModule,
		MaterialModule,
		NgIconComponent,
		InventoryGridComponent
	],
	providers: [
		provideIcons(iconRegistry)
	],
	templateUrl: './landing-page.component.html',
	styleUrl: './landing-page.component.css'
})

export class LandingPageComponent implements OnInit, AfterViewInit, OnDestroy {


	private shuffleAreaWidth = 700;  // Adjust this value as needed
	private shuffleAreaHeight = 500; // Adjust this value as needed
	private shuffleInterval: any;
	private hoverSubscription: Subscription | null = null;
	private clickSubscription: Subscription | null = null;

	constructor(private router: Router){
		
	}

	go() {
		this.router.navigate(['/dashboard']);
	}
	ngOnInit() {
		// Initial positioning will be handled in ngAfterViewInit
	}

	ngAfterViewInit() {
		this.startShuffleInterval();
		this.setupHoverListener();
		this.setupClickListener();
		this.setupSmoothScroll();
	}

	ngOnDestroy() {
		this.clearShuffleInterval();
		if (this.hoverSubscription) {
			this.hoverSubscription.unsubscribe();
		}
		if (this.clickSubscription) {
			this.clickSubscription.unsubscribe();
		}
	}

	setupSmoothScroll() {
		const links = document.querySelectorAll('nav a');
		links.forEach(link => {
			link.addEventListener('click', (e) => {
				e.preventDefault();
				const targetId = (e.target as HTMLAnchorElement).getAttribute('href')?.substring(1);
				const targetElement = document.getElementById(targetId || '');
				if (targetElement) {
					targetElement.scrollIntoView({ behavior: 'smooth' });
				}
			});
		});
	}


	shuffleImages() {
		const container = document.querySelector('.image-container');
		if (container) {
			const containerRect = container.getBoundingClientRect();

			const images = Array.from(document.querySelectorAll('.floating-image'));
			const shuffledIndexes = this.shuffleArray([...Array(images.length).keys()]);

			images.forEach((img: Element, index: number) => {
				const htmlImg = img as HTMLElement;
				const x = Math.random() * (this.shuffleAreaWidth - 250) + (containerRect.width - this.shuffleAreaWidth) / 2;
				const y = Math.random() * (this.shuffleAreaHeight - 250) + (containerRect.height - this.shuffleAreaHeight) / 2;

				htmlImg.style.left = `${x}px`;
				htmlImg.style.top = `${y}px`;
				htmlImg.style.zIndex = `${shuffledIndexes[index] + 2}`;
			});
		}
	}

	shuffleArray(array: number[]): number[] {
		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]];
		}
		return array;
	}

	startShuffleInterval() {
		this.shuffleInterval = setInterval(() => this.shuffleImages(), 10000); // 10 seconds
	}

	clearShuffleInterval() {
		if (this.shuffleInterval) {
			clearInterval(this.shuffleInterval);
		}
	}

	setupHoverListener() {
		const container = document.querySelector('.image-container');
		if (container) {
			this.hoverSubscription = fromEvent(container, 'mouseover')
				.pipe(debounceTime(100))
				.subscribe(() => {
					this.clearShuffleInterval();
				});

			this.hoverSubscription.add(
				fromEvent(container, 'mouseout')
					.pipe(debounceTime(100))
					.subscribe(() => {
						this.startShuffleInterval();
					})
			);
		}
	}

	setupClickListener() {
		const container = document.querySelector('.image-container');
		if (container) {
			this.clickSubscription = fromEvent(container, 'click')
				.subscribe(() => {
					this.shuffleImages();
					this.clearShuffleInterval();
					this.startShuffleInterval();
				});
		}
	}
}