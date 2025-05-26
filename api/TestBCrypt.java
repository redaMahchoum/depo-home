import org.springframework.security.crypto.scrypt.SCryptPasswordEncoder;

public class TestScrypt {
    public static void main(String[] args) {
        // The raw password
        String rawPassword = "password";
        
        SCryptPasswordEncoder encoder = new SCryptPasswordEncoder(
            16384,     // cpuCost (N)
            8,         // memoryCost (r)
            1,         // parallelization (p)
            32,        // keyLength
            64         // saltLength
        );
        
        // Generate a hash from the raw password
        String hash = encoder.encode(rawPassword);
        
        System.out.println("Raw password: " + rawPassword);
        System.out.println("SCrypt hash: " + hash);
        
        // Check if raw password matches generated hash
        boolean matches = encoder.matches(rawPassword, hash);
        System.out.println("Matches: " + matches);
        
        // Test with different password
        String differentPassword = "different";
        System.out.println("\nDifferent password: " + differentPassword);
        System.out.println("Matches with hash: " + encoder.matches(differentPassword, hash));
    }
}
