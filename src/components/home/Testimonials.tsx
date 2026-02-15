import { useState, memo } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const Testimonials = memo(function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    {
      id: 1,
      content:
        "Islakayd transformed how we source equipment for our construction projects. The AI assistant found us an excavator in minutes that would have taken days to locate through traditional channels. The pricing is transparent and the equipment quality has been exceptional.",
      author: 'Michael Chen',
      role: 'Construction Manager',
      company: 'BuildRight Co.',
      rating: 5,
      image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
      savings: '$15,000',
    },
    {
      id: 2,
      content:
        "As a professional photographer, I need reliable gear for every shoot. Islakayd's verification system gives me confidence that I'm renting quality equipment. The booking process is seamless, and I love being able to message owners directly.",
      author: 'Sarah Williams',
      role: 'Professional Photographer',
      company: 'Williams Studios',
      rating: 5,
      image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
      savings: '$8,500',
    },
    {
      id: 3,
      content:
        "We planned our entire wedding equipment through Islakayd. From the tent to the sound system, everything was delivered on time and in perfect condition. The Kayd AI even suggested items we hadn't thought of. Absolutely recommend!",
      author: 'David & Emma Thompson',
      role: 'Wedding Planners',
      company: 'Personal Event',
      rating: 5,
      image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg',
      savings: '$4,200',
    },
    {
      id: 4,
      content:
        "I list my landscaping equipment on Islakayd when it's not in use, and it's become a significant revenue stream. The platform handles everything - payments, insurance, even scheduling. Best decision I've made for my business.",
      author: 'James Rodriguez',
      role: 'Business Owner',
      company: 'GreenScape Landscaping',
      rating: 5,
      image: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg',
      savings: '$22,000 earned',
    },
  ];

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  return (
    <section className="py-24 bg-gray-900 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500/10 text-teal-400 rounded-full text-sm font-medium mb-4">
            <Star className="w-4 h-4 fill-teal-400" />
            Trusted by Thousands
          </span>
          <h2 className="text-4xl font-bold text-white mb-4">What Our Users Say</h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Join over 120,000 satisfied renters and owners who trust Islakayd for their
            equipment needs.
          </p>
        </div>

        <div className="relative">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="w-full flex-shrink-0 px-4">
                  <div className="max-w-4xl mx-auto">
                    <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-white/10">
                      <Quote className="w-12 h-12 text-teal-500 mb-6 opacity-50" />

                      <p className="text-xl md:text-2xl text-white leading-relaxed mb-8">
                        "{testimonial.content}"
                      </p>

                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                          <img
                            src={testimonial.image}
                            alt={testimonial.author}
                            className="w-16 h-16 rounded-full object-cover border-2 border-teal-500"
                          />
                          <div>
                            <p className="font-semibold text-white text-lg">
                              {testimonial.author}
                            </p>
                            <p className="text-gray-400">{testimonial.role}</p>
                            <p className="text-sm text-gray-500">{testimonial.company}</p>
                          </div>
                        </div>

                        <div className="flex flex-col items-start md:items-end gap-2">
                          <div className="flex items-center gap-1">
                            {[...Array(testimonial.rating)].map((_, i) => (
                              <Star
                                key={i}
                                className="w-5 h-5 text-amber-400 fill-amber-400"
                              />
                            ))}
                          </div>
                          <p className="text-teal-400 font-semibold">
                            {testimonial.savings} saved/earned
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prevTestimonial}
              className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? 'bg-teal-500 w-8'
                      : 'bg-white/30 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextTestimonial}
              className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
});

export default Testimonials;
