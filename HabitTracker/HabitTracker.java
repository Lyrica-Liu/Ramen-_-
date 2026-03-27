import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

public class HabitTracker {
    private List<Habit> habits = new ArrayList<>();
    private Scanner scanner = new Scanner(System.in);
    private LocalDate currentDate = LocalDate.now();

    public static void main(String[] args) {
        HabitTracker tracker = new HabitTracker();
        tracker.addSampleHabits();
        tracker.run();
    }

    private void addSampleHabits() {
        habits.add(new Habit("Drink 8 glasses of water"));
        habits.add(new Habit("Exercise for 30 minutes"));
        habits.add(new Habit("Read for 20 minutes"));
        habits.add(new Habit("Meditate"));
        habits.add(new Habit("Take vitamins"));
        habits.add(new Habit("Journal"));
    }

    private void run() {
        boolean running = true;
        while (running) {
            displayHeader();
            displayHabits();
            displayFooter();
            System.out.println("\n----- OPTIONS -----");
            System.out.println("1. Mark habit complete/incomplete");
            System.out.println("2. Add new habit");
            System.out.println("3. Delete habit");
            System.out.println("4. View statistics");
            System.out.println("5. Next day");
            System.out.println("0. Exit");
            System.out.print("\nEnter choice: ");

            String choice = scanner.nextLine().trim();
            switch (choice) {
                case "1":
                    markHabitComplete();
                    break;
                case "2":
                    addNewHabit();
                    break;
                case "3":
                    deleteHabit();
                    break;
                case "4":
                    viewStatistics();
                    break;
                case "5":
                    nextDay();
                    break;
                case "0":
                    running = false;
                    System.out.println("\nThanks for using Habit Tracker! Keep building good habits!");
                    break;
                default:
                    System.out.println("Invalid choice. Try again.");
            }
        }
        scanner.close();
    }

    private void displayHeader() {
        clearScreen();
        System.out.println("╔════════════════════════════════════════════════════════════╗");
        System.out.println("║           📅 DAILY HABIT TRACKER                           ║");
        System.out.println("╚════════════════════════════════════════════════════════════╝");
        System.out.println("\nDate: " + currentDate.format(DateTimeFormatter.ofPattern("EEEE, MMMM d, yyyy")));
        System.out.println();
    }

    private void displayHabits() {
        System.out.println("─── TODAY'S HABITS ───\n");
        for (int i = 0; i < habits.size(); i++) {
            Habit habit = habits.get(i);
            String checkbox = habit.isCompleted() ? "✓" : "○";
            String strikethrough = habit.isCompleted() ? "~" : " ";
            String status = habit.isCompleted() ? " [COMPLETED]" : "";
            System.out.printf("%d. [%s]%s %s%s\n", 
                i + 1, 
                checkbox, 
                strikethrough,
                habit.getName(),
                status);
            System.out.printf("   Added: %s | Streak: %d days | Progress: %.0f%%\n\n",
                habit.getDateAdded(),
                habit.getDaysCompleted(),
                habit.getProgress() * 100);
        }
    }

    private void displayFooter() {
        long completed = habits.stream().filter(Habit::isCompleted).count();
        System.out.println("─────────────────────────");
        System.out.printf("Completed Today: %d/%d habits\n", completed, habits.size());
        int allTimeCompleted = habits.stream().mapToInt(Habit::getDaysCompleted).sum();
        System.out.printf("Total Completions (All Time): %d\n", allTimeCompleted);
        System.out.println("─────────────────────────");
    }

    private void markHabitComplete() {
        System.out.print("\nEnter habit number to toggle (1-" + habits.size() + "): ");
        try {
            int index = Integer.parseInt(scanner.nextLine()) - 1;
            if (index >= 0 && index < habits.size()) {
                Habit habit = habits.get(index);
                habit.setCompleted(!habit.isCompleted());
                System.out.println("✓ Habit updated!");
            } else {
                System.out.println("Invalid habit number.");
            }
        } catch (NumberFormatException e) {
            System.out.println("Please enter a valid number.");
        }
    }

    private void addNewHabit() {
        System.out.print("\nEnter new habit: ");
        String habitName = scanner.nextLine().trim();
        if (!habitName.isEmpty()) {
            habits.add(new Habit(habitName));
            System.out.println("✓ Habit added: " + habitName);
        } else {
            System.out.println("Habit name cannot be empty.");
        }
    }

    private void deleteHabit() {
        System.out.print("\nEnter habit number to delete (1-" + habits.size() + "): ");
        try {
            int index = Integer.parseInt(scanner.nextLine()) - 1;
            if (index >= 0 && index < habits.size()) {
                String deleted = habits.remove(index).getName();
                System.out.println("✓ Deleted: " + deleted);
            } else {
                System.out.println("Invalid habit number.");
            }
        } catch (NumberFormatException e) {
            System.out.println("Please enter a valid number.");
        }
    }

    private void viewStatistics() {
        System.out.println("\n╔════ HABIT STATISTICS ════╗");
        int totalCompleted = 0;
        double avgProgress = 0;

        for (Habit habit : habits) {
            totalCompleted += habit.getDaysCompleted();
            avgProgress += habit.getProgress();
        }

        avgProgress = habits.isEmpty() ? 0 : avgProgress / habits.size();

        System.out.printf("Total Habits: %d\n", habits.size());
        System.out.printf("Total Completions: %d\n", totalCompleted);
        System.out.printf("Average Progress: %.0f%%\n", avgProgress * 100);
        System.out.printf("Daily Completion Rate: %.0f%%\n", 
            (habits.isEmpty() ? 0 : (habits.stream().filter(Habit::isCompleted).count() * 100.0 / habits.size())));

        System.out.println("\nTop Habits:");
        habits.stream()
            .sorted((a, b) -> Integer.compare(b.getDaysCompleted(), a.getDaysCompleted()))
            .limit(3)
            .forEach(h -> System.out.printf("  • %s (%d days)\n", h.getName(), h.getDaysCompleted()));

        System.out.println("╚═════════════════════════╝");
        System.out.print("\nPress Enter to continue...");
        scanner.nextLine();
    }

    private void nextDay() {
        currentDate = currentDate.plusDays(1);
        for (Habit habit : habits) {
            habit.resetDaily();
        }
        System.out.println("\n✓ Advanced to next day: " + currentDate.format(DateTimeFormatter.ofPattern("EEEE, MMMM d, yyyy")));
        System.out.print("Press Enter to continue...");
        scanner.nextLine();
    }

    private void clearScreen() {
        try {
            if (System.getProperty("os.name").contains("Windows")) {
                new ProcessBuilder("cmd", "/c", "cls").inheritIO().start().waitFor();
            } else {
                System.out.print("\033[H\033[2J");
                System.out.flush();
            }
        } catch (Exception e) {
            for (int i = 0; i < 50; i++) System.out.println();
        }
    }

    // Habit class
    static class Habit {
        private String name;
        private boolean completed;
        private LocalDate dateAdded;
        private int daysCompleted;

        public Habit(String name) {
            this.name = name;
            this.completed = false;
            this.dateAdded = LocalDate.now();
            this.daysCompleted = 0;
        }

        public String getName() { return name; }
        public boolean isCompleted() { return completed; }
        public int getDaysCompleted() { return daysCompleted; }
        public String getDateAdded() { 
            return dateAdded.format(DateTimeFormatter.ofPattern("MMM d, yyyy")); 
        }
        public double getProgress() { 
            return Math.min(daysCompleted / 30.0, 1.0); 
        }

        public void setCompleted(boolean completed) {
            if (!this.completed && completed) {
                daysCompleted++;
            }
            this.completed = completed;
        }

        public void resetDaily() {
            this.completed = false;
        }
    }
}
