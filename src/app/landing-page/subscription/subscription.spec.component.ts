import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SubscriptionComponent } from './subscription.component';
import { FormBuilder } from '@angular/forms';
import { SubscriptionService } from '../../services/subscription.service';
import { of, throwError } from 'rxjs';
import 'jasmine';


describe('SubscriptionComponent', () => {
	let component: SubscriptionComponent;
	let fixture: ComponentFixture<SubscriptionComponent>;
	let subscriptionServiceSpy: jasmine.SpyObj<SubscriptionService>;

	beforeEach(async () => {
		const spy = jasmine.createSpyObj('SubscriptionService', ['preSubscribe']);
		await TestBed.configureTestingModule({
			imports: [SubscriptionComponent],
			providers: [
				FormBuilder,
				{ provide: SubscriptionService, useValue: spy }
			]
		}).compileComponents();

		fixture = TestBed.createComponent(SubscriptionComponent);
		component = fixture.componentInstance;
		subscriptionServiceSpy = TestBed.inject(SubscriptionService) as jasmine.SpyObj<SubscriptionService>;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should mark form as touched if invalid on submit', () => {
		spyOn(component.suscripcionForm, 'markAllAsTouched');
		component.onSubmit();
		expect(component.suscripcionForm.markAllAsTouched).toHaveBeenCalled();
	});

	it('should call preSubscribe and handle success', fakeAsync(() => {
		component.suscripcionForm.setValue({ nombre: 'Test', email: 'test@email.com' });
		subscriptionServiceSpy.preSubscribe.and.returnValue(of({}));
		component.onSubmit();
		tick();
		expect(component.messageType).toBe('success');
		expect(component.message).toContain('Gracias por suscribirte');
		expect(component.suscripcionForm.value).toEqual({ nombre: null, email: null });
	}));

	it('should handle error response', fakeAsync(() => {
		component.suscripcionForm.setValue({ nombre: 'Test', email: 'test@email.com' });
		subscriptionServiceSpy.preSubscribe.and.returnValue(throwError(() => new Error('error')));
		component.onSubmit();
		tick();
		expect(component.messageType).toBe('error');
		expect(component.message).toContain('Este correo ya está registrado');
		expect(component.loading).toBe(false);
	}));
});
