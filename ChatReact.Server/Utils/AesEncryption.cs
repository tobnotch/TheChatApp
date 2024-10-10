using System.Security.Cryptography;
using System.Text;

namespace ChatReact.Server.Utils
{
  public class AesEncryption
  {
    private static readonly string _key;

    static AesEncryption()
    {
      var configBuilder = new ConfigurationBuilder()
          .SetBasePath(Directory.GetCurrentDirectory())
          .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
          .Build();

      _key = configBuilder["Encryption:Key"];
    }

    public static string Encrypt(string plainText)
    {
      using (Aes aesAlg = Aes.Create())
      {
        aesAlg.Key = Encoding.UTF8.GetBytes(_key);
        aesAlg.GenerateIV();

        var encryptor = aesAlg.CreateEncryptor(aesAlg.Key, aesAlg.IV);
        using (var ms = new MemoryStream())
        {
          ms.Write(aesAlg.IV, 0, aesAlg.IV.Length);
          using (var cs = new CryptoStream(ms, encryptor, CryptoStreamMode.Write))
          using (var sw = new StreamWriter(cs))
          {
            sw.Write(plainText);
          }

          return Convert.ToBase64String(ms.ToArray());
        }
      }
    }

    public static string Decrypt(string cipherText)
    {
      var fullCipher = Convert.FromBase64String(cipherText);

      using (Aes aesAlg = Aes.Create())
      {
        aesAlg.Key = Encoding.UTF8.GetBytes(_key);
        aesAlg.IV = fullCipher.Take(aesAlg.BlockSize / 8).ToArray();

        var decryptor = aesAlg.CreateDecryptor(aesAlg.Key, aesAlg.IV);
        using (var ms = new MemoryStream(fullCipher.Skip(aesAlg.BlockSize / 8).ToArray()))
        using (var cs = new CryptoStream(ms, decryptor, CryptoStreamMode.Read))
        using (var sr = new StreamReader(cs))
        {
          return sr.ReadToEnd();
        }
      }
    }
  }
}
